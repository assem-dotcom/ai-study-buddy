import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env') });

// Debug: Log the API key
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY);

// Validate Groq API key format
const validateApiKey = (apiKey) => {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in environment variables');
  }
  if (!apiKey.startsWith('gsk_')) {
    throw new Error('Invalid Groq API key format. API key should start with "gsk_"');
  }
  return true;
};

// Validate API key
validateApiKey(process.env.GROQ_API_KEY);

// Function to clean up the response
const cleanResponse = (text) => {
  // Remove thinking text between <think> tags
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,4}\s.*$/gm, '');
  
  // Remove any extra blank lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

const generateResponse = async (text, mode) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided');
    }

    let prompt;
    switch (mode) {
      case 'quiz':
        prompt = `Create a quiz based on the following study material. Include multiple choice questions, true/false questions, and short answer questions. Format the response in a clear, structured way:\n\n${text}`;
        break;
      case 'summary':
        prompt = `Provide a comprehensive summary of the following study material. Include key points, main concepts, and important details:\n\n${text}`;
        break;
      case 'podcast':
        prompt = `Create a podcast script based on the following study material. Make it engaging and conversational, as if explaining the concepts to a friend:\n\n${text}`;
        break;
      case 'tutor':
        prompt = `Act as a personal tutor and explain the following study material in a clear, step-by-step manner. Include examples and analogies to help with understanding:\n\n${text}`;
        break;
      default:
        throw new Error('Invalid mode');
    }

    console.log('Sending request to Groq API...');
    console.log('Mode:', mode);
    console.log('Text length:', text.length);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-r1-distill-llama-70b",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI study assistant. Provide direct, concise responses without any thinking text (nothing between <think> tags) or markdown headers (#, ##, ###, ####). Focus on delivering clear, structured information without any meta-commentary, thinking steps, or markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Groq API');
    }

    console.log('Successfully received response from Groq API');
    
    // Clean up the response before returning it
    const cleanedResponse = cleanResponse(data.choices[0].message.content);
    return cleanedResponse;
  } catch (error) {
    console.error('Groq API Error:', error);
    if (error.message.includes('API key')) {
      throw new Error('Groq API key is invalid or not configured correctly');
    }
    if (error.message.includes('rate limit')) {
      throw new Error('Groq API rate limit exceeded. Please try again later.');
    }
    throw new Error(`Failed to generate response from Groq: ${error.message}`);
  }
};

export { generateResponse }; 