require("dotenv").config();
const mongoose = require("mongoose");
const mongouri = process.env.MONGO_URI;

const authenticate = async () => {
  if (process.env.NODE_ENV !== "test") {
    await mongoose
      .connect(mongouri)
      .then(() => console.log("Database successfully conncected"))
      .catch((error) =>
        console.error("Failed to connect to database", error.message)
      );
  }
};

authenticate();
