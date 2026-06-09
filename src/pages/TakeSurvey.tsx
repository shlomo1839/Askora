import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Alert,
  Paper,
  LinearProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import QuestionViewerCard from '../components/survey/QuestionViewerCard';
import { StorageService } from '../services/storage';
import { getAllQuestions } from '../utils/surveyUtils';
import type { Answer, Question } from '../types/survey.types';

function findMissingRequired(
  questions: Question[],
  answers: Record<string, string | number | string[]>
): Question | undefined {
  return questions.find((question) => {
    if (!question.isRequired) {
      return false;
    }
    const answer = answers[question.id];
    return answer === undefined || answer === '';
  });
}

export default function TakeSurvey() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = surveyId ? StorageService.getSurveyById(surveyId) : undefined;

  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!survey) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            הסקר לא נמצא
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            הסקרים נשמרים ב-LocalStorage של הדפדפן. ודא שאתה באותו דפדפן שבו יצרת את הסקר,
            לא במצב incognito, ובאותה כתובת (localhost ולא 127.0.0.1).
          </Typography>
        </Paper>
      </Box>
    );
  }

  const { sections } = survey;
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;
  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    setAnswers({ ...answers, [questionId]: value });
    setError('');
  };

  const validateCurrentSection = (): boolean => {
    const missingRequired = findMissingRequired(currentSection.questions, answers);

    if (missingRequired) {
      setError(`יש לענות על השאלה: "${missingRequired.title}"`);
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) {
      return;
    }

    setCurrentSectionIndex((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (!validateCurrentSection()) {
      return;
    }

    const allQuestions = getAllQuestions(survey);
    const formattedAnswers: Answer[] = allQuestions
      .filter((question) => answers[question.id] !== undefined)
      .map((question) => ({
        questionId: question.id,
        value: answers[question.id],
      }));

    const submission = {
      id: crypto.randomUUID(),
      surveyId: survey.id,
      answers: formattedAnswers,
      submittedAt: new Date().toISOString(),
    };

    StorageService.saveSubmission(submission);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            תודה על מילוי הסקר!
          </Typography>
          <Typography color="text.secondary">התשובות שלך נשמרו בהצלחה.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {survey.title}
          </Typography>
          {survey.description && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {survey.description}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            קטע {currentSectionIndex + 1} מתוך {sections.length}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {currentSection.title && (
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {currentSection.title}
            </Typography>
          )}
          {currentSection.description && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {currentSection.description}
            </Typography>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {currentSection.questions.map((question, index) => (
          <QuestionViewerCard
            key={question.id}
            question={question}
            index={index}
            value={answers[question.id] ?? ''}
            onChange={(value) => handleAnswerChange(question.id, value)}
          />
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {isLastSection ? (
            <Button variant="contained" size="large" onClick={handleSubmit}>
              שליחת הסקר
            </Button>
          ) : (
            <Button variant="contained" size="large" onClick={handleNext}>
              הבא
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}
