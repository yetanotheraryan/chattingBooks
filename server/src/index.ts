import express from "express";
import cors from "cors";
import multer from "multer";

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

      const { originalname, mimetype, buffer } = req.file;

      console.log({
        originalname,
        mimetype,
        size: buffer.length
      });

      return res.json({
        message: "File uploaded successfully",
        filename: originalname
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