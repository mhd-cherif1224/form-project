const express = require("express");
const router = express.Router();

const {
    createClient,
    getClients,
    updateClient,
    checkClient,
    getReminders,
    dismissReminder,
    setReminder
} = require("../controllers/clientsController");

router.delete("/reminders/:id", dismissReminder);
router.get("/reminders", getReminders);
router.get("/check", checkClient);
router.get("/", getClients);
router.post("/", createClient);
router.put("/:id/reminder", setReminder);
router.put("/:id", updateClient);

module.exports = router;