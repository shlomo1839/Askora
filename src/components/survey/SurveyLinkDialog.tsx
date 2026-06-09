import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SurveyLinkDialogProps {
  open: boolean;
  surveyId: string;
  onClose: () => void;
}

export default function SurveyLinkDialog({ open, surveyId, onClose }: SurveyLinkDialogProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const surveyUrl = `${window.location.origin}/take-survey/${surveyId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSurvey = () => {
    onClose();
    navigate(`/take-survey/${surveyId}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>הסקר נוצר בהצלחה!</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          הסקר נשמר בדפדפן הנוכחי (LocalStorage). הקישור יעבוד רק באותו דפדפן ואותה כתובת
          (למשל localhost — לא 127.0.0.1).
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
          שתף את הקישור הבא עם המשיבים:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField fullWidth value={surveyUrl} slotProps={{ input: { readOnly: true } }} />
          <Button variant="outlined" onClick={handleCopy}>
            {copied ? 'הועתק!' : 'העתק'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleOpenSurvey}>
          פתח סקר
        </Button>
        <Button variant="contained" onClick={onClose}>
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
}
