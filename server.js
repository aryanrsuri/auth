import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import user from "./models/user.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((Error) => console.error(Error));

app.post("/api/user/login", async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }
    const match = await bcryptjs.compare(password, user.password);
    const token = jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET);
    if (match) {
      return response.json({
        message: `Logged in as ${user.username}`,
        token: token,
      });
    } else {
      return response.status(401).json({
        message: "Invalid Credentials",
      });
    }
  } catch (Error) {
    console.log("Error", Error);
  }
});

app.post("/api/user/gen", async (request, response) => {
  try {
    const hash = await bcryptjs.hash(request.body.password, 10);
    const user = new User({
      username: request.body.username,
      password: hash,
    });

    await user.save();
    return response.json({
      username: user.username,
      password: request.body.password,
    });
  } catch (Error) {
    return response.status(500).json({
      message: "User already exists",
    });
  }
});

app.get("/api/users", async (request, response) => {
  try {
    const users = await User.find();
    const usernames = users.map((user) => user.username);

    return response.json({ usernames });
  } catch (Error) {
    console.error(Error);
  }
});

app.delete("/api/user/del", async (request, response) => {
  try {
    const { token } = request.body;
    const user = jwt.verify(
      token,
      process.env.TOKEN_SECRET,
      (Error, Decoded) => {
        if (Error) {
          return response.status(401).json({
            message: "Invalid Token",
          });
        } else {
          return Decoded;
        }
      }
    );
    // shred the user and token

    const del = await User.findOneAndDelete({ username: user.username });

    if (del) {
      return response.json({
        message: `User ${user.username} deleted`,
      });
    } else {
      return response.status(400).json({
        message: "User not found",
      });
    }
  } catch (Error) {
    console.error(Error);
  }
});

// check if the use is a temp user
app.get("/api/user/temp", async (request, response) => {
  try {
    const { token } = request.body;
    const user = jwt.verify(
      token,
      process.env.TOKEN_SECRET,
      (Error, Decoded) => {
        if (Error) {
          return response.status(401).json({
            message: "Invalid Token",
          });
        } else {
          return Decoded;
        }
      }
    );

    const temp = await User.findOne({ username: user.username });
    if (temp.temp) {
      return response.json({
        message: `User ${user.username} is a temp user`,
      });
    } else {
      return response.json({
        message: `User ${user.username} is not a temp user`,
      });
    }
  } catch (Error) {
    console.error(Error);
  }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
