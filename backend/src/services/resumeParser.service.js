import mammoth from "mammoth";
import { fromPath } from "pdf2pic";
import Tesseract from "tesseract.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { createRequire } from "module";


const require = createRequire(
    import.meta.url);
const pdfParse = require("pdf-parse");



export const parseResume = async(file) => {
    let tempPdfPath = null;
    let imagePath = null;

    try {


        if (file.mimetype === "application/pdf") {


            try {
                const data = await pdfParse(file.buffer);
                const text = data?.text?.trim();

                if (text && text.length > 80) {
                    console.log("Normal PDF detected ");
                    return text;
                }

                throw new Error("SCANNED_PDF");
            } catch {

                console.log("Scanned PDF detected 🧠 → Running OCR...");


                tempPdfPath = path.join(os.tmpdir(), `resume_${Date.now()}.pdf`);
                await fs.writeFile(tempPdfPath, file.buffer);


                const converter = fromPath(tempPdfPath, {
                    density: 300,
                    saveFilename: "resume_page",
                    savePath: os.tmpdir(),
                    format: "png",
                    width: 1500,
                    height: 1500,


                    graphicsMagick: true,
                    gmPath: "/opt/homebrew/bin/gm"
                });

                const page = await converter(1);

                if (!page?.path)
                    throw new Error("PDF_TO_IMAGE_FAILED");

                imagePath = page.path;

                console.log("Image created:", imagePath);


                const { data } = await Tesseract.recognize(imagePath, "eng", {
                    logger: m => {
                        if (m.status === "recognizing text")
                            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                });

                const ocrText = data?.text?.trim();

                if (!ocrText || ocrText.length < 20)
                    throw new Error("OCR_FAILED");

                console.log("OCR extraction successful ");

                return ocrText;
            }
        }



        if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            console.log("DOCX detected 📄");

            const result = await mammoth.extractRawText({
                buffer: file.buffer,
            });

            return result.value;
        }



        throw new Error("Unsupported file type");


    } catch (err) {
        console.error("PARSE ERROR:", err.message);
        throw new Error("Unable to read resume");
    } finally {
        try {
            if (tempPdfPath) await fs.unlink(tempPdfPath);
            if (imagePath) await fs.unlink(imagePath);
        } catch {}
    }
};