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
  
  // Remove markdown bold formatting
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  
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
        prompt = `Create a quiz based on the following study material. Include multiple choice questions, true/false questions, and short answer questions. and the answer key in the end. Do not include any concluding statements at the end Format the response in a clear, structured way:\n\n${text}`;
        break;
      case 'summary':
        prompt = `Provide a comprehensive summary of the following study material using the following format:

        🎯 MAIN CONCEPT
        A brief 2-3 sentence overview of the main topic.

        📝 KEY COMPONENTS
        • Component 1: Description
        • Component 2: Description
        • Component 3: Description

        🔍 DETAILED BREAKDOWN
        1. First Major Point
           - Supporting detail
           - Supporting detail
           - Important numbers/calculations if any

        2. Second Major Point
           - Supporting detail
           - Supporting detail

        ⚡️ IMPORTANT HIGHLIGHTS
        • Key highlight 1
        • Key highlight 2
        • Key highlight 3

        🔬 TECHNICAL DETAILS (if applicable)
        • Formulas
        • Specific measurements
        • Critical parameters

        Use bullet points, clear spacing, and emojis as section markers to improve readability.
        Make sure each section is clearly separated with line breaks.
        Do not include any concluding statements at the end.

        Here's the material to summarize:\n\n${text}`;
        break;
      case 'podcast':
        prompt = `Create an engaging podcast script based on the following study material using this format:

        🎙️ EPISODE TITLE
        Create a catchy, relevant title for this topic

        🎯 EPISODE HOOK (30-45 seconds)
        An attention-grabbing introduction that makes the topic interesting and relatable

        📋 EPISODE OUTLINE
        • Topic 1
        • Topic 2
        • Topic 3

        🗣️ MAIN SCRIPT
        [Host 1] Opening lines...
        
        [Host 2] Response...
        
        Section 1: [Topic Name]
        [Host 1] Explanation...
        [Host 2] Examples/analogies...
        
        Section 2: [Topic Name]
        [Host 1] Explanation...
        [Host 2] Real-world applications...

        💡 KEY TAKEAWAYS
        • Main point 1
        • Main point 2
        • Main point 3

        🎬 OUTRO
        Brief wrap-up and call to action

        Format the script with clear speaker indicators [Host 1] and [Host 2].
        Use conversational language and natural dialogue transitions.
        Include relevant analogies and real-world examples.
        Keep technical terms to a minimum and explain them when used.

        Here's the material to convert into a podcast script:\n\n${text}`;
        break;
      case 'tutor':
        prompt = `Act as a personal tutor and explain the following study material using this format:

        🎯 LEARNING OBJECTIVES
        • Objective 1
        • Objective 2
        • Objective 3

        📚 PREREQUISITES
        List any fundamental concepts needed to understand this topic

        🔍 CONCEPT BREAKDOWN
        1. First Concept
           ⭐ Simple Definition
           📝 Detailed Explanation
           🌟 Real-world Example
           ❓ Check Understanding Question

        2. Second Concept
           ⭐ Simple Definition
           📝 Detailed Explanation
           🌟 Real-world Example
           ❓ Check Understanding Question

        💡 KEY INSIGHTS
        • Main insight 1
        • Main insight 2
        • Main insight 3

        📊 VISUAL AIDS (where applicable)
        Describe diagrams, charts, or visual representations that would help understand the concept

        ✍️ PRACTICE PROBLEMS
        1. Basic level question
           - Hint
           - Solution approach
           - Answer

        2. Intermediate level question
           - Hint
           - Solution approach
           - Answer

        🔗 CONNECTIONS
        Show how this topic connects to other related concepts

        Use clear explanations with plenty of examples.
        Break down complex ideas into smaller, manageable parts.
        Include practice problems with detailed solutions.
        Use analogies to explain difficult concepts.

        Here's the material to explain:\n\n${text}`;
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
    if (error.message.includes('Request too large')) {
      throw new Error('The text you provided is too long. Please try with a shorter text or split it into smaller sections.');
    }
    throw new Error(`Failed to generate response. Please try again with a shorter text.`);
  }
};

export { generateResponse }; 