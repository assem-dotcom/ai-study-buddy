import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

interface InputFieldProps {
  onSubmit: (text: string, file: File | null) => void;
  isLoading: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(text, file);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        label="Enter your study material"
        value={text}
        onChange={handleTextChange}
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ mb: 2 }}>
        <input
          accept=".pdf"
          style={{ display: 'none' }}
          id="file-upload"
          name="file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button variant="outlined" component="span">
            Upload PDF
          </Button>
        </label>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: {file.name}
          </Typography>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isLoading || (!text && !file)}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </Button>
    </Box>
  );
};

export default InputField; 