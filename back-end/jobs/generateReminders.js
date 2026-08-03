const cron = require("node-cron");
const db = require("../config/db");

function generateReminders() {

    const sql = `
        INSERT INTO reminders
        (client_id, nom, prenom, telephone, whatsapp, reservation_de_quoi, reservation_date)
        SELECT id, nom, prenom, telephone, whatsapp, reservation_de_quoi, reservation_date
        FROM clients
        WHERE reservation = 'Oui'
          AND reservation_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND id NOT IN (
              SELECT client_id
              FROM reminders
              WHERE reservation_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          )
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(`${result.affectedRows} reminder(s) generated`);
    });
}

cron.schedule("0 8 * * *", generateReminders);
generateReminders();

module.exports = generateReminders;