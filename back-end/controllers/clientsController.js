const db = require("../config/db");
const generateReminders = require("../jobs/generateReminders");

function normalizeReminderDatetimeToUtc(reminder_datetime) {
    if (!reminder_datetime) {
        return null;
    }

    const date = new Date(reminder_datetime);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 19).replace("T", " ");
}

function buildAutomaticReservationReminderDate(reservation_date) {
    if (!reservation_date) {
        return null;
    }

    const reminderDate = new Date(`${reservation_date}T09:00:00`);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(9, 0, 0, 0);

    return reminderDate.toISOString().slice(0, 19).replace("T", " ");
}

exports.createClient = (req, res) => {
    const {
        nom,
        prenom,
        fonctionne,
        telephone,
        whatsapp,
        facebook,
        instagram,
        snapchat,
        tiktok,
        reservation,
        reservation_de_quoi,
        reservation_date,
        description,
        travail,
        assigne_a,
        reminder_datetime
    } = req.body;

    const reminderDatetime = reminder_datetime ? normalizeReminderDatetimeToUtc(reminder_datetime) : null;
    const automaticReservationReminder = buildAutomaticReservationReminderDate(reservation_date);

    const sql = `
        INSERT INTO clients (
            nom,
            prenom,
            fonctionne,
            telephone,
            whatsapp,
            facebook,
            instagram,
            snapchat,
            tiktok,
            reservation,
            reservation_de_quoi,
            reservation_date,
            description,
            travail,
            assigne_a,
            reminder_datetime
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            nom,
            prenom,
            fonctionne,
            telephone,
            whatsapp,
            facebook,
            instagram,
            snapchat,
            tiktok,
            reservation,
            reservation_de_quoi,
            reservation_date,
            description,
            travail,
            assigne_a,
            reminderDatetime
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            const newClientId = result.insertId;

            if (automaticReservationReminder && (!reminder_datetime || reminder_datetime === "")) {
                const autoReminderSql = `
                    INSERT INTO reminders (
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
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                return db.query(
                    autoReminderSql,
                    [
                        newClientId,
                        nom,
                        prenom,
                        telephone,
                        whatsapp,
                        facebook,
                        instagram,
                        snapchat,
                        tiktok,
                        reservation_de_quoi || "Rappel programmé",
                        reservation_date
                    ],
                    (autoReminderErr) => {
                        if (autoReminderErr) {
                            console.error(autoReminderErr);
                        }

                        return res.status(201).json({
                            success: true,
                            message: "Client ajouté avec succès.",
                            id: newClientId
                        });
                    }
                );
            }

            return res.status(201).json({
                success: true,
                message: "Client ajouté avec succès.",
                id: newClientId
            });
        }
    );
};

exports.getClients = (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let countSql = `SELECT COUNT(*) AS total FROM clients`;
    let dataSql = `SELECT * FROM clients`;
    const params = [];
    const countParams = [];

    if (search) {
        const whereClause = `
            WHERE nom LIKE ? OR prenom LIKE ? OR fonctionne LIKE ?
               OR telephone LIKE ? OR whatsapp LIKE ? OR facebook LIKE ?
               OR instagram LIKE ? OR snapchat LIKE ? OR tiktok LIKE ?
               OR travail LIKE ? OR assigne_a LIKE ?
        `;
        countSql += whereClause;
        dataSql += whereClause;

        for (let i = 0; i < 11; i++) {
            params.push(search);
            countParams.push(search);
        }
    }

    dataSql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.query(countSql, countParams, (err, countResult) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        const total = countResult[0].total;

        db.query(dataSql, params, (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur serveur." });
            }

            res.json({
                clients: result,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });

        });

    });

};

exports.updateClient = (req, res) => {

    const { id } = req.params;

    const {
        nom,
        prenom,
        fonctionne,
        telephone,
        whatsapp,
        facebook,
        instagram,
        snapchat,
        tiktok,
        reservation,
        reservation_de_quoi,
        reservation_date,
        description,
        travail,
        assigne_a,
        reminder_datetime
    } = req.body;

    const fetchSql = `SELECT * FROM clients WHERE id = ?`;

    db.query(fetchSql, [id], (fetchErr, fetchResult) => {
        if (fetchErr) {
            console.error(fetchErr);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        const existingClient = fetchResult[0] || {};
        const safeReservation = reservation ?? existingClient.reservation ?? null;
        const safeReservationDeQuoi = reservation_de_quoi ?? existingClient.reservation_de_quoi ?? null;
        const safeReservationDate = reservation_date ?? existingClient.reservation_date ?? null;
        const existingReminder = existingClient.reminder_datetime ?? null;
        const reminderDatetime = reminder_datetime
            ? normalizeReminderDatetimeToUtc(reminder_datetime)
            : existingReminder;

        const sql = `
            UPDATE clients
            SET
                nom = ?,
                prenom = ?,
                fonctionne = ?,
                telephone = ?,
                whatsapp = ?,
                facebook = ?,
                instagram = ?,
                snapchat = ?,
                tiktok = ?,
                reservation = ?,
                reservation_de_quoi = ?,
                reservation_date = ?,
                description = ?,
                travail = ?,
                assigne_a = ?,
                reminder_datetime = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                nom ?? existingClient.nom,
                prenom ?? existingClient.prenom,
                fonctionne ?? existingClient.fonctionne,
                telephone ?? existingClient.telephone,
                whatsapp ?? existingClient.whatsapp,
                facebook ?? existingClient.facebook,
                instagram ?? existingClient.instagram,
                snapchat ?? existingClient.snapchat,
                tiktok ?? existingClient.tiktok,
                safeReservation,
                safeReservationDeQuoi,
                safeReservationDate,
                description ?? existingClient.description,
                travail ?? existingClient.travail,
                assigne_a ?? existingClient.assigne_a,
                reminderDatetime,
                id
            ],
            (err, result) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Client introuvable."
                    });
                }

                res.json({
                    success: true,
                    message: "Client modifié avec succès."
                });

            }
        );
    });

};
exports.checkClient = (req, res) => {

    const {
        nom,
        prenom,
        telephone,
        whatsapp,
        facebook,
        instagram,
        snapchat,
        tiktok
    } = req.query;

    // Build dynamic conditions only for fields that were actually provided
    const conditions = [];
    const params = [];

    if (nom && prenom) {
        conditions.push(`(LOWER(nom) = LOWER(?) AND LOWER(prenom) = LOWER(?))`);
        params.push(nom.trim(), prenom.trim());
    }

    if (telephone) {
        conditions.push(`telephone = ?`);
        params.push(telephone.trim());
    }

    if (whatsapp) {
        conditions.push(`whatsapp = ?`);
        params.push(whatsapp.trim());
    }

    if (facebook) {
        conditions.push(`LOWER(facebook) = LOWER(?)`);
        params.push(facebook.trim());
    }

    if (instagram) {
        conditions.push(`LOWER(instagram) = LOWER(?)`);
        params.push(instagram.trim());
    }

    if (snapchat) {
        conditions.push(`LOWER(snapchat) = LOWER(?)`);
        params.push(snapchat.trim());
    }

    if (tiktok) {
        conditions.push(`LOWER(tiktok) = LOWER(?)`);
        params.push(tiktok.trim());
    }

    if (conditions.length === 0) {
        return res.json({ exists: false });
    }

    const sql = `
        SELECT *
        FROM clients
        WHERE ${conditions.join(" OR ")}
        LIMIT 1
    `;

    db.query(sql, params, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        if (result.length === 0) {
            return res.json({ exists: false });
        }

        const existing = result[0];

        // Figure out exactly which fields matched, to build a clear message
        const matchedFields = [];

        if (
            nom && prenom &&
            existing.nom.toLowerCase() === nom.trim().toLowerCase() &&
            existing.prenom.toLowerCase() === prenom.trim().toLowerCase()
        ) {
            matchedFields.push("Nom et prénom");
        }

        if (telephone && existing.telephone === telephone.trim()) {
            matchedFields.push("Téléphone");
        }

        if (whatsapp && existing.whatsapp === whatsapp.trim()) {
            matchedFields.push("WhatsApp");
        }

        if (facebook && existing.facebook?.toLowerCase() === facebook.trim().toLowerCase()) {
            matchedFields.push("Facebook");
        }

        if (instagram && existing.instagram?.toLowerCase() === instagram.trim().toLowerCase()) {
            matchedFields.push("Instagram");
        }

        if (snapchat && existing.snapchat?.toLowerCase() === snapchat.trim().toLowerCase()) {
            matchedFields.push("Snapchat");
        }

        if (tiktok && existing.tiktok?.toLowerCase() === tiktok.trim().toLowerCase()) {
            matchedFields.push("TikTok");
        }

        res.json({
            exists: true,
            client: existing,
            matchedFields
        });

    });

};


exports.getReminders = (req, res) => {

    const sql = `SELECT * FROM reminders ORDER BY nom ASC`;

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        res.json(result);

    });

};

exports.dismissReminder = (req, res) => {

    const { id } = req.params;
    console.log("Attempting to delete reminder id:", id);

    const sql = `DELETE FROM reminders WHERE id = ?`;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        console.log("Rows deleted:", result.affectedRows);

        res.json({ success: true });

    });

};

exports.setReminder = (req, res) => {

    const { id } = req.params;
    const { reminder_datetime } = req.body;
    const normalizedReminderDatetime = normalizeReminderDatetimeToUtc(reminder_datetime);

    const sql = `
        UPDATE clients
        SET reminder_datetime = ?
        WHERE id = ?
    `;

    db.query(sql, [normalizedReminderDatetime, id], (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }

        res.json({
            success: true,
            message: "Rappel enregistré.",
            reminder_datetime: normalizedReminderDatetime
        });

    });

};