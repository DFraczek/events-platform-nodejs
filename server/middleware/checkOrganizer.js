const Event = require("../models/event");

const checkOrganizer = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userEmail = req.user.email;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send({ message: "Event not found" });
    }

    if (event.organizer !== userEmail) {
      return res.status(403).send({ message: "Access denied" });
    }

    next();
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = checkOrganizer;
