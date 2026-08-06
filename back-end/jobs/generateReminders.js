const cron = require("node-cron");
const { EventEmitter } = require("events");
const db = require("../config/db");

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

        db.query(
        `
        SELECT id, reminder_datetime
        FROM clients
        WHERE reminder_datetime IS NOT NULL
        `,
        (err, rows) => {
            if (!err) {
                console.log("Pending reminders:", rows);
            }
        }
    );

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

const clearSql = `
    UPDATE clients
    SET reminder_datetime = NULL
    WHERE reminder_datetime IS NOT NULL
      AND reminder_datetime <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)
`;

    db.query(insertSql, (err, result) => {

        if (err) {
            console.error(err);
            return;
        }

        console.log(`${result.affectedRows} reminder(s) generated`);

        if (result.affectedRows === 0) return;

        // Clear reminder_datetime on the clients we just fired a reminder for.
        // Without this, the cron re-inserts the same reminder every minute
        // forever — including right after the user dismisses it.
        const clearSql = `
            UPDATE clients
            SET reminder_datetime = NULL
            WHERE reminder_datetime IS NOT NULL
              AND reminder_datetime <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)
        `;

        db.query(clearSql, (clearErr, clearResult) => {

            if (clearErr) {
                console.error(clearErr);
                return;
            }

            console.log(`${clearResult.affectedRows} client reminder(s) cleared`);
            reminderEvents.emit("reminder-generated", { count: result.affectedRows });

        });

    });

}

function generateReservationReminders() {

    const insertSql = `
        INSERT INTO reminders
        (
            client_id, nom, prenom, telephone, whatsapp, facebook,
            instagram, snapchat, tiktok, reservation_de_quoi, reservation_date
        )
        SELECT
            c.id, c.nom, c.prenom, c.telephone, c.whatsapp, c.facebook,
            c.instagram, c.snapchat, c.tiktok, c.reservation_de_quoi, c.reservation_date
        FROM clients c
        WHERE c.reservation = 'Oui'
          AND c.reservation_date IS NOT NULL
          AND DATE(c.reservation_date) = CURDATE()
          AND NOT EXISTS (
              SELECT 1 FROM reminders r
              WHERE r.client_id = c.id
                AND r.reservation_date = c.reservation_date
          )
    `;

    db.query(insertSql, (err, result) => {

        if (err) {
            console.error(err);
            return;
        }

        console.log(`${result.affectedRows} reservation reminder(s) generated`);

        if (result.affectedRows > 0) {
            reminderEvents.emit("reminder-generated", { count: result.affectedRows });
        }

    });

}

cron.schedule("* * * * *", generateReminders);
cron.schedule("0 8 * * *", generateReservationReminders); // 08:00 UTC = 09:00 Sétif
generateReminders();

module.exports = generateReminders;
module.exports.reminderEvents = reminderEvents;
module.exports.generateReservationReminders = generateReservationReminders;