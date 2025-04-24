import { generateResponse } from './openai.js';
import { extractTextFromPDF } from './pdfParser.js';

export const process = async (req, res) => {
  try {
    console.log('=== Request Details ===');
    console.log('Headers:', req.headers);
    console.log('Body:', {
      mode: req.body.mode,
      hasText: !!req.body.text,
      textLength: req.body.text ? req.body.text.length : 0,
      hasFile: !!req.file
    });

    const { mode, text } = req.body;
    let content;

    if (!mode) {
      console.log('Error: Mode is missing');
      return res.status(400).json({ error: 'Mode is required' });
    }

    if (req.file) {
      console.log('Processing PDF file...');
      try {
        content = await extractTextFromPDF(req.file.buffer);
        console.log('PDF text extracted successfully');
      } catch (error) {
        console.error('PDF processing error:', error);
        return res.status(400).json({ error: `Failed to process PDF: ${error.message}` });
      }
    } else if (text) {
      console.log('Processing text input...');
      content = text;
    } else {
      console.log('Error: No content provided');
      return res.status(400).json({ error: 'No content provided' });
    }

    if (!content || content.trim().length === 0) {
      console.log('Error: Empty content after processing');
      return res.status(400).json({ error: 'No valid content to process' });
    }

    console.log('Generating response for mode:', mode);
    try {
      const response = await generateResponse(content, mode);
      console.log('Response generated successfully');
      res.json({ response });
    } catch (error) {
      console.error('Response generation error:', error);
      console.error('Error stack:', error.stack);
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'Groq API key is not configured correctly' });
      }
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ error: 'Groq API rate limit exceeded. Please try again later.' });
      }
      res.status(500).json({ error: `Failed to generate response: ${error.message}` });
    }
  } catch (error) {
    console.error('Processing Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred'
    });
  }
}; 