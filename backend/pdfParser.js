import pdf from 'pdf-parse/lib/pdf-parse.js';

export const extractTextFromPDF = async (buffer) => {
  try {
    console.log('Starting PDF parsing...');
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty PDF buffer received');
    }
    
    const data = await pdf(buffer);
    console.log('PDF parsed successfully, text length:', data.text.length);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    
    return data.text;
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
}; 