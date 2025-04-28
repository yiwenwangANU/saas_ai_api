export const protectedRoute = (req, res, next) => {
  res.send("<p>Protected Route</p>");
};

export default { protectedRoute };
