// server.js
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserValidationSchema = require("./schema"); // Import your Zod schema
const jwtpassword = "123456"; // Consider storing secrets securely

app.use(express.json());
app.use(cors());

function loadUserData() {
  try {
    const data = fs.readFileSync("users.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveUserData(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2), "utf-8");
}

function isEmailUnique(email, users) {
  return !users.some((user) => user.email === email);
}

function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

function userExists(email, password, users) {
  return users.some(
    (user) =>
      user.email === email && bcrypt.compareSync(password, user.password),
  );
}

// Route for signup using Zod validation
app.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Validate the request body against the Zod schema
    const validatedUser = UserValidationSchema.parse({ email, password });

    // Load existing user data
    const existingUsers = loadUserData();

    // Check if email is unique
    if (!isEmailUnique(validatedUser.email, existingUsers)) {
      return res.status(400).json({
        msg: "Email already exists",
      });
    }

    // Add the new user to the array
    const newUser = {
      id: Math.random().toString(),
      email: validatedUser.email,
      password: hashPassword(validatedUser.password),
    };

    existingUsers.push(newUser);

    // Save the updated user data to the JSON file
    saveUserData(existingUsers);

    res.send({
      msg: "User registered successfully",
    });
  } catch (error) {
    res.status(400).json({
      msg: "Invalid request body",
      errors: error.errors || [error.message],
    });
  }
});

// Route for signin using Zod validation
app.post("/signin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Load existing user data
  const existingUsers = loadUserData();

  if (!userExists(email, password, existingUsers)) {
    return res.status(403).json({
      msg: "Invalid credentials",
    });
  }

  const token = jwt.sign({ email: email }, jwtpassword);
  res.json({
    token,
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
