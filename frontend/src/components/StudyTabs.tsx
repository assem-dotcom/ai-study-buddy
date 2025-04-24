import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface StudyTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const StudyTabs: React.FC<StudyTabsProps> = ({ currentTab, onTabChange }) => {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentTab} onChange={handleChange} aria-label="study tabs">
        <Tab label="Quiz" value="quiz" />
        <Tab label="Summary" value="summary" />
        <Tab label="Podcast" value="podcast" />
        <Tab label="Tutor" value="tutor" />
      </Tabs>
    </Box>
  );
};

export default StudyTabs; 