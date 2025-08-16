import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

export async function extractTextFromS3(bucketname, filename) {
  const params = {
    Document: {
      S3Object: {
        Bucket: bucketname,
        Name: filename,
      },
    },
    FeatureTypes: ["FORMS"],
  };

  const textract = new TextractClient({});
  const data = await textract.send(new AnalyzeDocumentCommand(params));

  console.debug(data);

  return data.Blocks
    .filter(b => b.BlockType === "LINE")
    .map(b => b.Text);
}

export function cleanLines(lines) {
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^(Page \d+|Confidential)$/i));
}

export function extractFieldsFromText(lines) {
  const text = lines.join(' ');
  return {
    name: lines[0], // assumes name is first line
    email: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || null,
    phone: text.match(/(?:\+?\d{1,3})?\s?(?:\(?\d{2,4}\)?\s?)?\d{3,4}[-\s]?\d{4}/)?.[0] || null,
    skills: extractSkills(lines),
    education: extractEducation(lines),
    experience: extractExperience(lines),
  };
}

function extractSkills(lines) {
  const skills = [];
  let capturing = false;

  for (const line of lines) {
    if (/skills|technical skills|programming skills/i.test(line)) {
      capturing = true;
      continue;
    }
    if (capturing && /education|experience|projects|hackathons|summary/i.test(line)) {
      break; // stop at next section
    }
    if (capturing) {
      const cleaned = line
        .replace(/^[•\-–\*]\s*/, "") // remove bullets
        .trim();
      if (cleaned) {
        // split comma or semicolon separated skills
        const parts = cleaned.split(/[,;•|]/).map(s => s.trim()).filter(Boolean);
        skills.push(...parts);
      }
    }
  }
  return [...new Set(skills)]; // remove duplicates
}

function extractEducation(lines) {
  return lines.filter(line =>
    /university|college|bachelor|master|degree|diploma/i.test(line)
  );
}

function extractExperience(lines) {
  const experience = [];
  let capturing = false;

  const dateRegex =
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s.,-]?\s?\d{4}\b/i;

  for (const line of lines) {
    if (/work experience|previous experience|professional experience|experience/i.test(line)) {
      capturing = true;
      continue;
    }
    // stop at next major section
    if (capturing && /education|projects|skills|hackathons|summary/i.test(line)) {
      break;
    }
    if (capturing) {
      const trimmed = line.trim();
      if (trimmed && !dateRegex.test(trimmed)) { // Skip empty or date lines
        experience.push(trimmed);
      }
    }
  }
  return experience;
}