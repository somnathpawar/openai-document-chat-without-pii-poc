const { ComprehendClient, DetectPiiEntitiesCommand } = require("@aws-sdk/client-comprehend");

const client = new ComprehendClient({ region: "us-east-1" });

async function redactPII(text) {
  const command = new DetectPiiEntitiesCommand({
    LanguageCode: "en",
    Text: text,
  });

  const response = await client.send(command);
  const entities = response.Entities || [];

  //console.log("Detected PII Types:", entities.map(e => e.Type)); 

  // Only redact sensitive PII types, not names
  const sensitiveTypes = ["EMAIL", "PHONE", "ADDRESS", "SSN", "CREDIT_DEBIT_NUMBER"];
  const piiEntities = entities
    .filter(e => sensitiveTypes.includes(e.Type))
    .sort((a, b) => b.BeginOffset - a.BeginOffset); // Process in reverse order


  let redactedText = text;
  for (const { BeginOffset, EndOffset, Type } of piiEntities) {
    redactedText =
      redactedText.slice(0, BeginOffset) +
      `[REDACTED_${Type}]` +
      redactedText.slice(EndOffset);
  }

  //console.log("redactedText:", redactedText); 


  return redactedText;
}

module.exports = redactPII;