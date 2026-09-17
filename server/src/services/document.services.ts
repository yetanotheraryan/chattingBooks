import { PDFParse } from "pdf-parse";

export async function extractText(
  buffer: Buffer,
  mimetype: string
): Promise<string> {

  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (mimetype === "application/pdf") {
    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
  }

  throw new Error("Unsupported file type");
}