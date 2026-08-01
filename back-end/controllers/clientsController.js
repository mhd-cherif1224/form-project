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

    const sql = `
        SELECT *
        FROM clients
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                message: "Erreur serveur."
            });

        }

        res.json(result);

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