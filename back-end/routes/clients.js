const express = require("express");
const router = express.Router();

const {
    createClient,
    getClients,
    updateClient
} = require("../controllers/clientsController");

router.get("/", getClients);
router.post("/", createClient);
router.put("/:id", updateClient);

module.exports = router;