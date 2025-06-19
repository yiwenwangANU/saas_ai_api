import User from "../models/User.js";

export const checkSubscribe = async (req, res, next) => {
  const userId = req.userId;

  try {
    // 4. Create and save user
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.subscriptionActive)
      return res.status(401).json({ message: "Subscribe in not active" });

    next();
  } catch (err) {
    next(err);
  }
};
