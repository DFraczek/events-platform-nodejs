const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Event } = require("../models/event");

// Endpoint to pobrania wydarzeń utworzonych przez użytkownika
router.get("/created", auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.email });
    res.status(200).send(events);
  } catch (error) {
    console.error("Bład poczas pobierania wydarzeń:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Endpoint do pobrania wydarzeń na które użytkownik jest zapisany
router.get("/signed-up", auth, async (req, res) => {
  try {
    const events = await Event.find({ participants: req.user.email });
    res.status(200).send(events);
  } catch (error) {
    console.error("Bład poczas pobierania wydarzeń:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
