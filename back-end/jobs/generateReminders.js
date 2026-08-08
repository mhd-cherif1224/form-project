const cron = require("node-cron");
const { EventEmitter } = require("events");
const db = require("../config/db");
const { sendEmailToDev } = require("../emailservice/emailService");

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
            INSERT INTO reminders
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
                reservation_date
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
                reminder_datetime
            FROM clients
            WHERE reminder_datetime IS NOT NULL
              AND reminder_datetime <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)
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
                        `Rappel : ${client.nom} ${client.prenom}`,
                        `
Un nouveau rappel est arrivé.

Nom : ${client.nom || "N/A"}
Prénom : ${client.prenom || "N/A"}

Téléphone : ${client.telephone || "N/A"}
WhatsApp : ${client.whatsapp || "N/A"}

Facebook : ${client.facebook || "N/A"}
Instagram : ${client.instagram || "N/A"}
Snapchat : ${client.snapchat || "N/A"}
TikTok : ${client.tiktok || "N/A"}

Rappel prévu le : ${client.reminder_datetime || "N/A"}

Description :
${client.description || "N/A"}
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
          AND DATE(c.reservation_date) = CURDATE()
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
            INSERT INTO reminders
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
                reservation_date
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
                c.reservation_date
            FROM clients c
            WHERE c.reservation = 'Oui'
              AND c.reservation_date IS NOT NULL
              AND DATE(c.reservation_date) = CURDATE()
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
                        `Réservation : ${client.nom} ${client.prenom}`,
                        `
Une réservation nécessite votre attention.

Nom : ${client.nom || "N/A"}
Prénom : ${client.prenom || "N/A"}

Téléphone : ${client.telephone || "N/A"}
WhatsApp : ${client.whatsapp || "N/A"}

Réservation : ${client.reservation_de_quoi || "N/A"}
Date de réservation : ${client.reservation_date || "N/A"}

Facebook : ${client.facebook || "N/A"}
Instagram : ${client.instagram || "N/A"}
Snapchat : ${client.snapchat || "N/A"}
TikTok : ${client.tiktok || "N/A"}
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
cron.schedule("0 8 * * *", generateReservationReminders);


/*
 * Run once immediately when the server starts.
 */
generateReminders();


module.exports = generateReminders;
module.exports.reminderEvents = reminderEvents;
module.exports.generateReservationReminders =
    generateReservationReminders;