const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  comments: [commentSchema],
});

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "Sportowe",
      "Kulturalne",
      "Edukacyjne",
      "Rozrywkowe",
      "Charytatywne",
      "Biznesowe",
    ],
    required: true,
  },
  location: { type: String, required: true },
  members: { type: Number, default: 0 },
  maxMembers: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizer: { type: String, required: true },
  participants: [{ type: String }],
  discussion: [postSchema],
});

const Event = mongoose.model("Event", eventSchema);

const validateEvent = (data) => {
  const schema = Joi.object({
    eventName: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .valid(
        "Sportowe",
        "Kulturalne",
        "Edukacyjne",
        "Rozrywkowe",
        "Charytatywne",
        "Biznesowe",
        "Inne"
      )
      .required(),
    location: Joi.string().required(),
    members: Joi.number().integer().default(0),
    maxMembers: Joi.number().integer().min(1).required(),
    startDate: Joi.date().min("now").required(),
    endDate: Joi.date().min("now").required(),
    organizer: Joi.string().required(),
    participants: Joi.array().items(Joi.string()),
    discussion: Joi.array().items(
      Joi.object({
        email: Joi.string().email().required(),
        message: Joi.string().required(),
        timestamp: Joi.date(),
        comments: Joi.array().items(
          Joi.object({
            email: Joi.string().email().required(),
            message: Joi.string().required(),
            timestamp: Joi.date(),
          })
        ),
      })
    ),
  }).custom((obj, helpers) => {
    if (obj.startDate >= obj.endDate) {
      return helpers.message("Start date must be earlier than end date");
    }
    return obj;
  });

  return schema.validate(data);
};

module.exports = { Event, validateEvent };
