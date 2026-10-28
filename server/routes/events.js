const express = require("express");
const router = express.Router();
const { Event, validateEvent } = require("../models/event");
const auth = require("../middleware/auth");
const authorizeEventAccess = require("../middleware/authorizeEventAccess");
const checkOrganizer = require("../middleware/checkOrganizer");

router.put("/:id", auth, checkOrganizer, async (req, res) => {
  try {
    const { error } = validateEvent(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event)
      return res.status(404).send({ message: "Nie znaleziono wydarzenia" });

    res.send(event);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error } = validateEvent(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const event = await Event.create(req.body);
    res.status(201).send(event);
  } catch (error) {
    console.error("Błąd podczas tworzenia wydarzenia:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).send(events);
  } catch (error) {
    console.error("Błąd podczas pobierania wydarzeń:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send({ message: "Nie znaleziono wydarzenia" });
    }
    res.status(200).send(event);
  } catch (error) {
    console.error("Błąd podczas pobierania szczegółów wydarzenia:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/signup/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { email } = req.body;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $push: { participants: email } },
      { new: true },
    );

    res.status(200).json(event);
  } catch (error) {
    console.error("Błąd podczas zapisywania użytkownika na wydarzenie:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/leave/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { email } = req.body;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { participants: email } },
      { new: true },
    );

    res.status(200).json(event);
  } catch (error) {
    console.error("Błąd podczas opuszczania wydarzenia:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).send({ message: "Nie znaleziono wydarzenia" });
    }

    res.status(200).json({ message: "Pomyslnie usunięto wydarzenie" });
  } catch (error) {
    console.error("Błąd podczas usuwania wydarzenia:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).send({ message: "Nie znaleziono wydarzenia" });
    }

    existingEvent.set(req.body);
    const updatedEvent = await existingEvent.save();

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Błąd podczas aktualizacji wydarzenia:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/discussion/:id", auth, authorizeEventAccess, async (req, res) => {
  try {
    res.status(200).send(req.event.discussion);
  } catch (error) {
    console.error("Błąd podczas ładowania postów w dyskusji:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/discussion/:id", auth, authorizeEventAccess, async (req, res) => {
  try {
    const { email, message } = req.body;

    req.event.discussion.push({ email, message });
    await req.event.save();

    res.status(200).send(req.event.discussion);
  } catch (error) {
    console.error("Błąd podczas dodawania posta w dyskusji:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post(
  "/discussion/:id/comments/:postId",
  auth,
  authorizeEventAccess,
  async (req, res) => {
    try {
      const postId = req.params.postId;
      const { email, message } = req.body;

      const post = req.event.discussion.id(postId);
      if (!post) {
        return res.status(404).send({ message: "Nie znaleziono posta" });
      }

      post.comments.push({ email, message });
      await req.event.save();

      res.status(200).send(post.comments);
    } catch (error) {
      console.error("Błąd podczas dodawania komentarza:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

router.put(
  "/discussion/:id/comments/:postId/:commentId",
  auth,
  authorizeEventAccess,
  async (req, res) => {
    try {
      const { id, postId, commentId } = req.params;
      const { email, message } = req.body;

      const event = await Event.findById(id);
      if (!event)
        return res.status(404).send({ message: "Nie znaleziono wydarzenia" });

      const post = event.discussion.id(postId);
      if (!post)
        return res.status(404).send({ message: "Nie znaleziono postu" });

      const comment = post.comments.id(commentId);
      if (!comment)
        return res.status(404).send({ message: "Nie znaleziono komentarza" });

      if (comment.email !== email)
        return res.status(403).send({ message: "Brak uprawnień" });

      comment.message = message;
      await event.save();

      res.status(200).send(post.comments);
    } catch (error) {
      console.error("Błąd podczas edycji komentarza:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

router.delete(
  "/discussion/:id/posts/:postId",
  auth,
  authorizeEventAccess,
  async (req, res) => {
    try {
      const { id, postId } = req.params;
      const { email } = req.body;

      const event = await Event.findById(id);
      if (!event)
        return res.status(404).send({ message: "Nie znaleziono wydarzenia" });

      const post = event.discussion.id(postId);
      if (!post)
        return res.status(404).send({ message: "Nie znaleziono postu" });

      if (post.email !== email)
        return res.status(403).send({ message: "Brak uprawnień" });

      event.discussion.pull(postId);
      await event.save();

      res.status(200).send(event.discussion);
    } catch (error) {
      console.error("Błąd podczas usuwania posta:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

router.delete(
  "/discussion/:id/comments/:postId/:commentId",
  auth,
  authorizeEventAccess,
  async (req, res) => {
    try {
      const { id, postId, commentId } = req.params;
      const { email } = req.body;

      const event = await Event.findById(id);
      if (!event)
        return res.status(404).send({ message: "Nie znaleziono wydarzenia" });

      const post = event.discussion.id(postId);
      if (!post)
        return res.status(404).send({ message: "Nie znaleziono postu" });

      const comment = post.comments.id(commentId);
      if (!comment)
        return res.status(404).send({ message: "Nie znaleziono komentarza" });

      if (comment.email !== email)
        return res.status(403).send({ message: "Brak uprawnien" });

      post.comments.pull(commentId);
      await event.save();

      res.status(200).send(post.comments);
    } catch (error) {
      console.error("Błąd podczas usuwania komentarza:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

router.put(
  "/discussion/:id/posts/:postId",
  auth,
  authorizeEventAccess,
  async (req, res) => {
    try {
      const { id, postId } = req.params;
      const { email, message } = req.body;

      const event = await Event.findById(id);
      if (!event)
        return res.status(404).send({ message: "Nie znaleziono wydarzenia" });

      const post = event.discussion.id(postId);
      if (!post)
        return res.status(404).send({ message: "Nie znaleziono postA" });

      if (post.email !== email)
        return res.status(403).send({ message: "Brak uprawnień" });

      post.message = message;
      await event.save();

      res.status(200).send(event.discussion);
    } catch (error) {
      console.error("Błąd podczas edycji posta:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

module.exports = router;
