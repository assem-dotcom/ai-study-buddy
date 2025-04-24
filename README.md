# AI Study Helper

An AI-powered study assistant that helps students learn better by generating quizzes, summaries, podcasts, and acting as a personal tutor.

## Features

- **Quiz Generation**: Create quizzes from study materials
- **Summary Generation**: Get concise summaries of study materials
- **Podcast Generation**: Convert study materials into engaging podcast scripts
- **Personal Tutor**: Get step-by-step explanations of concepts

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd study-helper
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your-openai-api-key-here
PORT=3001
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Select a mode (Quiz, Summary, Podcast, or Tutor)
2. Enter your study material in the text field or upload a PDF file
3. Click "Generate" to get the AI-generated response
4. View the generated content in the response section

## Technologies Used

- Frontend: React, TypeScript, Material-UI
- Backend: Node.js, Express
- AI: OpenAI GPT-4
- File Processing: pdf-parse

## License

MIT 