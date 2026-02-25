import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(
    import.meta.url);
const pdfParse = require("pdf-parse");

export const parseResume = async(file) => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }

        if (!file.mimetype) {
            throw new Error("Invalid file type");
        }


        if (file.mimetype === "application/pdf") {
            const data = await pdfParse(file.buffer);

            const text = data?.text?.trim();

            if (!text || text.length < 30) {
                throw new Error("Resume text extraction failed");
            }

            console.log("PDF text extraction successful");

            return text;
        }


        if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const result = await mammoth.extractRawText({
                buffer: file.buffer,
            });

            const text = result?.value?.trim();

            if (!text || text.length < 30) {
                throw new Error("DOCX text extraction failed");
            }

            console.log("DOCX text extraction successful");

            return text;
        }


        throw new Error("Unsupported file type");

    } catch (err) {
        console.error("PARSE ERROR:", err.message);
        throw new Error("Unable to read resume");
    }
};
