const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const auth = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    req.user = decoded;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send({ message: "Invalid user." });
    req.user = user;
    next();
  } catch (ex) {
    res.status(400).send({ message: "Invalid token." });
  }
};

module.exports = auth;
