import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export const signup = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get error message from validator
      const errorMessages = errors
        .array()
        .map((err) => err.msg)
        .join(" ");

      const error = new Error(
        errorMessages || "Validation failed, entered data is incorrect."
      );
      error.statusCode = 422;
      return next(error);
    }

    // 2. Get data from req body
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const name = req.body.name;

    // 3. Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create and save user
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
      name: name,
    });

    // 5. Return response (exclude password)
    res.status(201).json({
      message: "User created successfully!",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    // 1. Get data from req body
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    // 2. Check if email exist
    const user = await User.findOne({ email: email });
    const authError = new Error("Email or password is incorrect.");

    authError.statusCode = 401;
    if (!user) {
      return next(authError);
    }

    // 3. Check if password is empty(user from oauth)
    if (!user.password) {
      return next(authError);
    }

    // 4. Check if the password match
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      return next(authError);
    }

    // 5. Generate a JWT.
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 6. Send response
    res.status(201).json({
      message: `Welcome back ${user.name}!`,
      token: token,
      name: user.name,
    });
  } catch (err) {
    next(err);
  }
};

export const googleAuthRedirect = (req, res) => {
  // After Google Oauth success, req.user will be a user object
  // Generate a JWT.
  const token = jwt.sign(
    {
      userId: req.user._id.toString(),
      email: req.user.email,
      name: req.user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const clientUrl = process.env.CLIENT_URL;

  // send message to opener(main app window) to tranfer data between windows
  res.send(`
    <script>
      window.opener.postMessage({ token: "${token}", message: "Welcome, ${req.user.name}", name: "${req.user.name}" }, "${clientUrl}");
      window.close();
    </script>
  `);
};

export const checkSubscription = async (req, res, next) => {
  const userId = req.userId;

  try {
    // 4. Create and save user
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ subscriptionActive: user.subscriptionActive });
  } catch (err) {
    next(err);
  }
};
export default {
  signup,
  login,
  googleAuthRedirect,
  checkSubscription,
};
