const db = require("../config/db");

exports.createClient = (req, res) => {
    console.log("req.body:", req.body);
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
    description,
    travail,
    assigne_a
} = req.body;

    const sql = `
        INSERT INTO clients
        (
            nom,
            prenom,
            fonctionne,
            telephone,
            whatsapp,
            facebook,
            instagram,
            snapchat,
            tiktok,
            description,
            travail,
            assigne_a
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            description,
            travail,
            assigne_a
        ],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Client ajouté avec succès.",
                id: result.insertId
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
        description,
        travail,
        assigne_a
    } = req.body;

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
            description = ?,
            travail = ?,
            assigne_a = ?
        WHERE id = ?
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
            description,
            travail,
            assigne_a,
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