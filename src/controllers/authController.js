import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const signup = async (req, res, next) => {
  try {
    // in case of validate failed
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

    // create post object from req
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    // Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const name = req.body.name;

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });
    // insert object into mongodb
    const result = await user.save();
    res.status(201).json({
      message: "User created successfully!",
      user: result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    // get email and password from req
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    // check if there is any user using that email
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Email or password is wrong.");
      error.statusCode = 401;
      return next(error);
    }
    // check if user was from oauth
    if (!user.password) {
      const error = new Error("Email or password is wrong.");
      error.statusCode = 401;
      return next(error);
    }
    // check if the password match
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      const error = new Error("Email or password is wrong.");
      error.statusCode = 401;
      return next(error);
    }

    // Generate a JWT.
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User login successfully!",
      token: token,
      userId: user._id.toString(),
    });
  } catch (err) {
    next(err);
  }
};

export const googleAuthRedirect = (req, res) => {
  // Generate a JWT.
  const token = jwt.sign(
    { userId: req.user._id.toString(), email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};

export default {
  signup,
  login,
  googleAuthRedirect,
};
