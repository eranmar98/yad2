import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

//////////// Route imports ///////////
import usersRouter from "./routes/users";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/////////// Routes ///////////
app.use("/api/users", usersRouter);
////////////////////

mongoose.connect(process.env.MONGODB_CONNECTION as string)
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
})
  .catch((err) => console.error("Error connecting to MongoDB:", err));