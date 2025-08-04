// backend/services/textractService.js
import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.AWS_REGION,
});

const textract = new AWS.Textract();

export async function extractTextFromS3(fileName) {
    const params = {
        Document: {
            S3Object: {
                Bucket: process.env.AWS_S3_BUCKET,
                Name: fileName // exact match, case-sensitive
            }
        },
        FeatureTypes: ['TABLES', 'FORMS']
    };


  return new Promise((resolve, reject) => {
    textract.analyzeDocument(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const lines = data.Blocks
          .filter(b => b.BlockType === 'LINE')
          .map(b => b.Text);
        resolve(lines);
      }
    });
  });
}

// At the end of textractService.js

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
    skills: extractSkills(text),
    education: extractEducation(lines),
  };
}

function extractSkills(text) {
  const knownSkills = ['JavaScript', 'Python', 'Java', 'Node.js', 'React', 'AWS', 'SQL'];
  return knownSkills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
}

function extractEducation(lines) {
  return lines.filter(line =>
    /university|college|bachelor|master|degree|diploma/i.test(line)
  );
}

