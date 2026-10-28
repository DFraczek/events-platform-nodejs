const { Event } = require("../models/event");

const authorizeEventAccess = async (req, res, next) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).send({ message: "Event not found." });

    const isParticipant = event.participants.includes(req.user.email);
    const isOrganizer = event.organizer === req.user.email;

    if (!isParticipant && !isOrganizer) {
      return res.status(403).send({ message: "Access denied." });
    }

    req.event = event;
    next();
  } catch (error) {
    console.error("Error authorizing event access:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = authorizeEventAccess;
