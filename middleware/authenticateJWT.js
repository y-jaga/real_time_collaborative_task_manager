require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  //Retrieve the authorization headers
  const authHeader = req.headers.authorization;

  if (authHeader) {
    //Expected format: Bearer <token>
    const token = authHeader.split(" ")[1];

    //Verify the token using the secret key
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        //If token is invalid or expired, return 403 error
        return res.status(403).json({ error: "Invalid token" });
      }

      // Attach the decoded user info (e.g., _id : user._id) to req.user
      req.user = decoded;
      console.log(decoded);
      next();
    });
  } else {
    // No token provided
    res.status(401).json({ error: "Authorization header is missing" });
  }
};

module.exports = { authenticateJWT };
