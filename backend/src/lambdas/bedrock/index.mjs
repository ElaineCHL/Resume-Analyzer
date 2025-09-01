import {
  S3Client,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import {
  TextractClient,
  DetectDocumentTextCommand
} from "@aws-sdk/client-textract";
import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

// Initialize AWS clients with the correct region
const s3Client = new S3Client({
  region: "ap-southeast-1"
});
const textractClient = new TextractClient({
  region: "ap-southeast-1"
});
const bedrockClient = new BedrockRuntimeClient({
  region: "ap-southeast-1"
});

// Model ID for the large language model
const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

/**
 * Generates a concise summary of a resume from a PDF file.
 */
export const handler = async (event) => {
  console.log("Lambda function invoked. Event:", JSON.stringify(event, null, 2));

  try {
    // Correctly access path parameters from the event object
    const {
      bucketName,
      s3Key
    } = event.pathParameters;

    if (!bucketName || !s3Key) {
      console.error("Missing 'bucketName' or 's3Key' in path parameters.");
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing 'bucketName' or 's3Key' in path parameters."
        }),
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS, POST"
        }
      };
    }

    // ⭐ CORRECT THE S3 KEY BY DECODING THE URI COMPONENT
    const decodedS3Key = decodeURIComponent(s3Key);

    console.log(`Processing S3 object: s3://${bucketName}/${decodedS3Key}`);

    // 1. Download the PDF from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedS3Key,
    });
    const s3Object = await s3Client.send(getObjectCommand);
    const resumeData = await s3Object.Body.transformToByteArray();

    console.log("Successfully downloaded resume from S3.");

    // 2. Extract text from the PDF using Textract
    const textractCommand = new DetectDocumentTextCommand({
      Document: {
        Bytes: resumeData
      },
    });
    const textractResponse = await textractClient.send(textractCommand);
    console.log("Successfully extracted text with Textract.");

    const extractedText = textractResponse.Blocks.filter(
        (block) => block.BlockType === "LINE"
      )
      .map((block) => block.Text)
      .join(" ");

    if (!extractedText) {
      console.warn("Textract extracted no text from the document.");
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Could not extract text from document."
        }),
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS, POST"
        }
      };
    }

    // 3. Create the prompt for the LLM
    const prompt = `
            You are a world-class resume analyzer. Your task is to generate a concise, professional, and accurate summary of the following resume text. Focus on the individual's key skills, qualifications, work experience, and accomplishments.
            
            Resume Text:
            ${extractedText}
            
            Summary:
        `;

    // 4. Invoke the Bedrock model to summarize the text
    const payload = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: prompt
        }]
      }],
    });

    const invokeModelCommand = new InvokeModelCommand({
      body: payload,
      contentType: "application/json",
      accept: "application/json",
      modelId: MODEL_ID,
    });

    console.log("Invoking Bedrock model...");

    const bedrockResponse = await bedrockClient.send(invokeModelCommand);
    console.log("Successfully received response from Bedrock.");

    const decodedBody = new TextDecoder().decode(bedrockResponse.body);
    const responseBody = JSON.parse(decodedBody);
    const summary = responseBody.content[0].text;
    console.log("Final Summary:", summary); // Add this line

    // 5. Return the summary
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // ADD THESE CORS HEADERS
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        data: {
          summary: summary
        }
      }),
    };
  } catch (error) {
    console.error("Error generating resume summary:", error);
    // Return a 500 status code with a descriptive error message
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error. Please check Lambda logs for details."
      }),
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST"
      }
    };
  }
};