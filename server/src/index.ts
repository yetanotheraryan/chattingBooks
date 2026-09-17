import express from "express";
import cors from "cors";
import multer from "multer";
import { extractText } from "./services/document.services";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok"
  });
});

app.post(
  "/documents/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded"
        });
      }

      const text = await extractText(
        req.file.buffer,
        req.file.mimetype
      );

      console.log("Extracted text:");
      console.log(text);

      return res.json({
        message: "Document processed",
        filename: req.file.originalname,
        characters: text.length,
        text
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to upload file"
      });
    }
  }
);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});