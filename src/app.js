import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import pageRoute from "./routes/pageRoutes.js";
import stripeRoute from "./routes/stripeRoutes.js";

import "./middlewares/passport.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    methods: "GET, POST, PUT, PATCH, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.get("/health", (req, res) => {
  res.sendStatus(200); // returns HTTP 200 OK
});

app.use(authRoutes);
app.use(pageRoute);
app.use("/api/stripe", stripeRoute);

app.use(errorHandler);
mongoose
  .connect(process.env.MONGOOSE_CONNECTION_STRING)
  .then((result) =>
    app.listen(8080, "0.0.0.0", () => {
      console.log("Server running on port 8080");
    })
  )
  .catch((err) => console.log(err));
