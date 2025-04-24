import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import StudyTabs from './components/StudyTabs';
import InputField from './components/InputField';
import ResponseDisplay from './components/ResponseDisplay';

// Define the API response type
interface ApiResponse {
  response: string;
}

// Define error response type
interface ErrorResponse {
  error: string;
}

function App() {
  const [currentTab, setCurrentTab] = useState('quiz');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setResponse(null);
  };

  const handleSubmit = async (text: string, file: File | null) => {
    setIsLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (text) {
        formData.append('text', text);
      }
      formData.append('mode', currentTab);

      console.log('Sending request to backend...');
      const { data } = await axios.post<ApiResponse>('http://localhost:4000/api/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Received response from backend');
      setResponse(data.response);
    } catch (error: unknown) {
      console.error('Error details:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: ErrorResponse } };
        console.error('Axios error response:', axiosError.response);
        if (axiosError.response?.status === 400) {
          setResponse(`Error: ${axiosError.response.data.error || 'Invalid request'}`);
        } else if (axiosError.response?.status === 413) {
          setResponse('Error: File size too large. Maximum size is 10MB.');
        } else if (axiosError.response?.status === 500) {
          setResponse(`Server Error: ${axiosError.response.data.error || 'An unexpected error occurred on the server'}`);
        } else {
          setResponse(`Error: Failed to connect to the server (${axiosError.response?.status || 'unknown status'}). Please try again later.`);
        }
      } else {
        setResponse('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          AI Study Buddy
        </Typography>
        
        <StudyTabs currentTab={currentTab} onTabChange={handleTabChange} />
        <InputField onSubmit={handleSubmit} isLoading={isLoading} />
        <ResponseDisplay response={response} isLoading={isLoading} />
      </Box>
    </Container>
  );
}

export default App;
