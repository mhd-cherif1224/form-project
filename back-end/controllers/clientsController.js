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