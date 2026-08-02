const express = require("express");
const router = express.Router();

const {
    createClient,
    getClients,
    updateClient,
    checkClient
} = require("../controllers/clientsController");

router.get("/check", checkClient);
router.get("/", getClients);
router.post("/", createClient);
router.put("/:id", updateClient);

module.exports = router;