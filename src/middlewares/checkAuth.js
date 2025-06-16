import jwt from "jsonwebtoken";

export const checkAuth = (req, res, next) => {
  // Expecting the header in the format: "Bearer <token>"
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error(
      "Not authenticated. No Authorization header provided."
    );
    error.statusCode = 401;
    return next(error);
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    const error = new Error("Not authenticated. Token missing.");
    error.statusCode = 401;
    return next(error);
  }

  let decodedToken;
  try {
    // Verify token using the secret from your environment variables
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 500;
    return next(err);
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated. Invalid token.");
    error.statusCode = 401;
    return next(error);
  }

  // Optionally, attach user information to the request object
  req.userId = decodedToken.userId;
  next();
};
