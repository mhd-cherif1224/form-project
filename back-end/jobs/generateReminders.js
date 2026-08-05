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
          AND reminder_datetime <= UTC_TIMESTAMP()
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

cron.schedule("* * * * *", generateReminders);
cron.schedule("0 8 * * *", generateReminders);
generateReminders();

module.exports = generateReminders;
module.exports.reminderEvents = reminderEvents;