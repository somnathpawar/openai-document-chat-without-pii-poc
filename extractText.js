const fs = require("fs");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");

async function extractText(filePath, mimetype) {
  if (mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  return fs.readFileSync(filePath, "utf-8");
}

module.exports = extractText;