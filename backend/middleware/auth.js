const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (req, res, next) => {

  try {

    // Get token from header
    const token = req.headers.authorization.split(" ")[1];

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Add user from payload

    const userId = decodedToken.userId;

    // Check if user exists
    
    req.auth = { userId };
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid User ID";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error(),
    });
  }
};
