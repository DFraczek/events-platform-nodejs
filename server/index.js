require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const userEvents = require("./routes/userEvents");

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/user-events", userEvents);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Nasłuchiwanie na porcie ${port}`));

const connection = require("./db");
connection();
