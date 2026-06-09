import {
  Box,
  Typography,
  Container,
  Paper,
  LinearProgress,
  Chip,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { StorageService } from '../services/storage';
import type { Question, SurveySubmission } from '../types/survey.types';

function getAnswerValue(
  submission: SurveySubmission,
  questionId: string
): string | number | string[] | undefined {
  const answer = submission.answers.find((a) => a.questionId === questionId);
  return answer?.value;
}

function MultipleChoiceStats({ question, submissions }: { question: Question; submissions: SurveySubmission[] }) {
  const options = question.options ?? [];
  const totalAnswers = submissions.length;

  return (
    <Box>
      {options.map((option) => {
        const count = submissions.filter(
          (sub) => getAnswerValue(sub, question.id) === option
        ).length;
        const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;

        return (
          <Box key={option} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{option}</Typography>
              <Typography variant="body2" color="text.secondary">
                {count} ({Math.round(percentage)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function RatingStats({ question, submissions }: { question: Question; submissions: SurveySubmission[] }) {
  const ratings = submissions
    .map((sub) => getAnswerValue(sub, question.id))
    .filter((value): value is number => typeof value === 'number');

  const average =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom sx={{ fontWeight: 'bold' }}>
        {average.toFixed(1)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        ממוצע מתוך {ratings.length} תשובות
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => {
          const count = ratings.filter((r) => r === rating).length;
          return (
            <Chip
              key={rating}
              label={`${rating}: ${count}`}
              variant={count > 0 ? 'filled' : 'outlined'}
              size="small"
            />
          );
        })}
      </Box>
    </Box>
  );
}

function OpenStats({ question, submissions }: { question: Question; submissions: SurveySubmission[] }) {
  const textAnswers = submissions
    .map((sub) => getAnswerValue(sub, question.id))
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '');

  if (textAnswers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        אין תשובות עדיין
      </Typography>
    );
  }

  return (
    <Box>
      {textAnswers.map((answer, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
          <Typography variant="body2">{answer}</Typography>
        </Paper>
      ))}
    </Box>
  );
}

export default function SurveyResults() {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const currentUser = StorageService.getCurrentUser();
  const survey = surveyId ? StorageService.getSurveyById(surveyId) : undefined;
  const submissions = surveyId ? StorageService.getAnswersForSurvey(surveyId) : [];

  if (!survey) {
    return (
      <AppLayout>
        <Container sx={{ py: 4 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            הסקר לא נמצא
          </Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            חזרה ללוח הבקרה
          </Button>
        </Container>
      </AppLayout>
    );
  }

  if (!currentUser || !StorageService.isSurveyOwner(survey.id, currentUser.id)) {
    return (
      <AppLayout>
        <Container sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            אין לך הרשאה לצפות בתוצאות של סקר זה
          </Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            חזרה ללוח הבקרה
          </Button>
        </Container>
      </AppLayout>
    );
  }

  let questionCounter = 0;

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          חזרה ללוח הבקרה
        </Button>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          תוצאות: {survey.title}
        </Typography>

        <Chip
          label={`${submissions.length} משיבים`}
          color="primary"
          sx={{ mb: 4 }}
        />

        {submissions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">עדיין אין תשובות לסקר זה</Typography>
          </Paper>
        ) : (
          survey.sections.map((section) => (
            <Box key={section.id} sx={{ mb: 4 }}>
              <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {section.title}
                </Typography>
                {section.description && (
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                    {section.description}
                  </Typography>
                )}
              </Paper>

              {section.questions.map((question) => {
                questionCounter += 1;
                const displayIndex = questionCounter;

                return (
                  <Paper key={question.id} elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {displayIndex}. {question.title}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {question.type === 'multiple-choice' && (
                      <MultipleChoiceStats question={question} submissions={submissions} />
                    )}
                    {question.type === 'rating' && (
                      <RatingStats question={question} submissions={submissions} />
                    )}
                    {question.type === 'open' && (
                      <OpenStats question={question} submissions={submissions} />
                    )}
                  </Paper>
                );
              })}
            </Box>
          ))
        )}
      </Container>
    </AppLayout>
  );
}
