import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load environment variables from the backend/.env file
const result = config({ path: join(__dirname, '.env') });

// Only log error if we're in development mode
if (result.error && process.env.NODE_ENV === 'development') {
  console.warn('Warning: .env file not found, using environment variables');
}

// Validate environment variables
const validateEnv = () => {
  const requiredEnvVars = ['GROQ_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Error: Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  if (!process.env.GROQ_API_KEY.startsWith('gsk_')) {
    console.error('Error: Invalid Groq API key format. API key should start with "gsk_"');
    process.exit(1);
  }
};

// Export environment variables and validation function
export const env = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

export { validateEnv }; 