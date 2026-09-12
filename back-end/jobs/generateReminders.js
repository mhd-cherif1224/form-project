const cron = require("node-cron");
const { EventEmitter } = require("events");
const db = require("../config/db");
const { sendEmailToDev } = require("../emailservice/emailService");
const {sendFlightReservationSMS} = require("../smsservice/smsService");

const reminderEvents = new EventEmitter();

function generateReminders() {
    console.log("UTC :", new Date().toISOString());

    db.query(
        "SELECT UTC_TIMESTAMP() AS utc, NOW() AS now",
        (err, rows) => {
            if (!err) {
                console.log(rows[0]);
            }
        }
    );

    // Get all reminders that are due
    const dueRemindersSql = `
        SELECT *
        FROM clients
        WHERE reminder_datetime IS NOT NULL
          AND reminder_datetime <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)
    `;

    db.query(dueRemindersSql, async (err, clients) => {
        if (err) {
            console.error("Error fetching due reminders:", err);
            return;
        }

        if (clients.length === 0) {
            return;
        }

        console.log(`${clients.length} reminder(s) due`);

        /*
         * Insert the due reminders into the reminders table.
         */
        const insertSql = `
            INSERT IGNORE INTO reminders
            (
                client_id,
                nom,
                prenom,
                telephone,
                whatsapp,
                facebook,
                instagram,
                snapchat,
                tiktok,
                reservation_de_quoi,
                reservation_date,
                assigne_a
            )
            SELECT
                id,
                nom,
                prenom,
                telephone,
                whatsapp,
                facebook,
                instagram,
                snapchat,
                tiktok,
                'Rappel programmé',
                reminder_datetime,
                assigne_a
            FROM clients
            WHERE reminder_datetime IS NOT NULL
              AND reminder_datetime <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)
              AND NOT EXISTS (
                  SELECT 1 FROM reminders r
                  WHERE r.client_id = clients.id
                    AND r.reservation_date = clients.reminder_datetime
              )
        `;

        db.query(insertSql, async (err, result) => {
            if (err) {
                console.error("Error generating reminders:", err);
                return;
            }

            console.log(`${result.affectedRows} reminder(s) generated`);

            if (result.affectedRows === 0) {
                return;
            }

            /*
             * Send an email for every reminder that was generated.
             */
            for (const client of clients) {
    try {
        await sendEmailToDev(
    `Rappel : ${client.nom} ${client.prenom} - ${client.assigne_a || "N/A"}`,
    `
        <div style="font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f5f7; padding: 24px;">

            <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background: #4f46e5; padding: 24px 28px;">
                    <p style="margin: 0; color: #e0e7ff; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                        Ziguad Rappel
                    </p>
                    <h1 style="margin: 4px 0 0; color: #ffffff; font-size: 20px;">
                        Nouveau rappel
                    </h1>
                </div>

                <div style="padding: 28px;">

                    <!-- Client + assignment badge -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <div>
                            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                                ${client.nom || "N/A"} ${client.prenom || ""}
                            </p>
                        </div>
                        <span style="background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 999px; white-space: nowrap;">
                            ${client.assigne_a || "Non assigné"}
                        </span>
                    </div>

                    <!-- Reminder date, highlighted -->
                    <div style="background: #fef9c3; border-left: 4px solid #eab308; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 12px; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px;">
                            Prévu le
                        </p>
                        <p style="margin: 2px 0 0; font-size: 15px; font-weight: 600; color: #713f12;">
                            ${client.reminder_datetime || "N/A"}
                        </p>
                    </div>

                    <!-- Contacts -->
                    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 10px;">
                        Contacts
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280; width: 40%;">Téléphone</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.telephone || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">WhatsApp</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.whatsapp || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Facebook</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.facebook || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Instagram</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.instagram || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Snapchat</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.snapchat || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">TikTok</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.tiktok || "N/A"}</td>
                        </tr>
                    </table>

                    <!-- Description -->
                    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 10px;">
                        Description
                    </h3>
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; font-size: 14px; color: #374151; white-space: pre-line; line-height: 1.5;">
                        ${client.description || "Aucune description"}
                    </div>

                </div>

                <!-- Footer -->
                <div style="background: #f9fafb; padding: 16px 28px; border-top: 1px solid #eee;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        Cet e-mail a été envoyé automatiquement par Ziguad Rappel.
                    </p>
                </div>

            </div>
        </div>
        `.trim()

        );

        console.log(
            `Email sent for reminder: ${client.nom} ${client.prenom}`
        );

    } catch (emailError) {
        console.error(
            `Failed to send email for ${client.nom} ${client.prenom}:`,
            emailError
        );
    }
}

            /*
             * Clear reminder_datetime so the same reminder
             * isn't generated again on the next cron run.
             */
            const clearSql = `
                UPDATE clients
                SET reminder_datetime = NULL
                WHERE reminder_datetime IS NOT NULL
                  AND reminder_datetime <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)
            `;

            db.query(clearSql, (clearErr, clearResult) => {
                if (clearErr) {
                    console.error("Error clearing reminders:", clearErr);
                    return;
                }

                console.log(
                    `${clearResult.affectedRows} client reminder(s) cleared`
                );

                reminderEvents.emit("reminder-generated", {
                    count: result.affectedRows
                });
            });
        });
    });
}


function generateReservationReminders() {

    /*
     * First get the reservations that need a reminder.
     * We need the client information so we can send the email.
     */
    const getReservationsSql = `
        SELECT
            c.*
        FROM clients c
        WHERE c.reservation = 'Oui'
          AND c.reservation_date IS NOT NULL
          AND DATE(c.reservation_date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND NOT EXISTS (
              SELECT 1
              FROM reminders r
              WHERE r.client_id = c.id
                AND r.reservation_date = c.reservation_date
          )
    `;

    db.query(getReservationsSql, async (err, clients) => {
        if (err) {
            console.error("Error fetching reservation reminders:", err);
            return;
        }

        if (clients.length === 0) {
            return;
        }

        /*
         * Insert reservation reminders.
         */
        const insertSql = `
            INSERT IGNORE INTO reminders
            (
                client_id,
                nom,
                prenom,
                telephone,
                whatsapp,
                facebook,
                instagram,
                snapchat,
                tiktok,
                reservation_de_quoi,
                reservation_date,
                assigne_a
            )
            SELECT
                c.id,
                c.nom,
                c.prenom,
                c.telephone,
                c.whatsapp,
                c.facebook,
                c.instagram,
                c.snapchat,
                c.tiktok,
                c.reservation_de_quoi,
                c.reservation_date,
                c.assigne_a
            FROM clients c
            WHERE c.reservation = 'Oui'
              AND c.reservation_date IS NOT NULL
              AND DATE(c.reservation_date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
              AND NOT EXISTS (
                  SELECT 1
                  FROM reminders r
                  WHERE r.client_id = c.id
                    AND r.reservation_date = c.reservation_date
              )
        `;

        db.query(insertSql, async (err, result) => {
            if (err) {
                console.error(
                    "Error generating reservation reminders:",
                    err
                );
                return;
            }

            console.log(
                `${result.affectedRows} reservation reminder(s) generated`
            );

            if (result.affectedRows === 0) {
                return;
            }

            /*
             * Send an email for every reservation reminder.
             */
            for (const client of clients) {
                try {
                    await sendEmailToDev(
    `Réservation : ${client.nom} ${client.prenom} - ${client.assigne_a || "N/A"}`,
    `
        <div style="font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f5f7; padding: 24px;">

            <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background: #059669; padding: 24px 28px;">
                    <p style="margin: 0; color: #d1fae5; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                        Ziguad Réservation
                    </p>
                    <h1 style="margin: 4px 0 0; color: #ffffff; font-size: 20px;">
                        Nouvelle réservation
                    </h1>
                </div>

                <div style="padding: 28px;">

                    <p style="margin: 0 0 24px; font-size: 14px; color: #374151;">
                        Une réservation nécessite votre attention.
                    </p>

                    <!-- Client + assignment badge -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                            <td>
                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                                    ${client.nom || "N/A"} ${client.prenom || ""}
                                </p>
                            </td>
                            <td style="text-align: right;">
                                <span style="background: #d1fae5; color: #059669; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 999px; white-space: nowrap;">
                                    ${client.assigne_a || "Non assigné"}
                                </span>
                            </td>
                        </tr>
                    </table>

                    <!-- Reservation details, highlighted -->
                    <div style="background: #ecfdf5; border-left: 4px solid #059669; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 12px; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">
                            Réservation
                        </p>
                        <p style="margin: 2px 0 8px; font-size: 15px; font-weight: 600; color: #064e3b;">
                            ${client.reservation_de_quoi || "N/A"}
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">
                            Date
                        </p>
                        <p style="margin: 2px 0 0; font-size: 15px; font-weight: 600; color: #064e3b;">
                            ${client.reservation_date || "N/A"}
                        </p>
                    </div>

                    <!-- Contacts -->
                    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 10px;">
                        Contacts
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280; width: 40%;">Téléphone</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.telephone || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">WhatsApp</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.whatsapp || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Facebook</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.facebook || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Instagram</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.instagram || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Snapchat</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.snapchat || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">TikTok</td>
                            <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500;">${client.tiktok || "N/A"}</td>
                        </tr>
                    </table>

                    <!-- Description -->
                    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 10px;">
                        Description
                    </h3>
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; font-size: 14px; color: #374151; white-space: pre-line; line-height: 1.5;">
                        ${client.description || "Aucune description"}
                    </div>

                </div>

                <!-- Footer -->
                <div style="background: #f9fafb; padding: 16px 28px; border-top: 1px solid #eee;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        Cet e-mail a été envoyé automatiquement par Ziguad Rappel.
                    </p>
                </div>

            </div>
        </div>
        `.trim()
);

                    console.log(
                        `Reservation email sent for: ${client.nom} ${client.prenom}`
                    );
                } catch (emailError) {
                    console.error(
                        `Failed to send reservation email for ${client.nom} ${client.prenom}:`,
                        emailError
                    );
                }

                // Also SMS the client directly, so they get their own reminder
                if (client.telephone) {
                    try {
                        await sendFlightReservationSMS({
                            nom: client.nom,
                            prenom: client.prenom,
                            telephone: client.telephone,
                            reservation_time: client.reservation_date
                        });

                        console.log(
                            `Reservation SMS sent for: ${client.nom} ${client.prenom}`
                        );
                    } catch (smsError) {
                        console.error(
                            `Failed to send reservation SMS for ${client.nom} ${client.prenom}:`,
                            smsError
                        );
                    }
                } else {
                    console.log(
                        `No phone number for ${client.nom} ${client.prenom}, skipping SMS`
                    );
                }
            }

            reminderEvents.emit("reminder-generated", {
                count: result.affectedRows
            });
        });
    });
}


/*
 * Normal reminders:
 * Runs every minute.
 */
cron.schedule("* * * * *", generateReminders);


/*
 * Reservation reminders:
 * 08:00 UTC = 09:00 Algeria/Sétif
 */
cron.schedule("30 12 * * *", generateReservationReminders);


/*
 * Run once immediately when the server starts.
 */
generateReminders();


module.exports = generateReminders;
module.exports.reminderEvents = reminderEvents;
module.exports.generateReservationReminders =
    generateReservationReminders;