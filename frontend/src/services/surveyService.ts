import { apiRequest } from './api';
import type { Answer, Survey, SurveySubmission } from '../types/survey.types';

interface SurveyPayload {
  id?: string;
  title: string;
  description: string;
  sections: Survey['sections'];
}

export const SurveyService = {
  async getMySurveys(): Promise<Survey[]> {
    const data = await apiRequest<{ surveys: Survey[] }>('/api/surveys');
    return data.surveys;
  },

  async createSurvey(payload: SurveyPayload): Promise<Survey> {
    const data = await apiRequest<{ survey: Survey }>('/api/surveys', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.survey;
  },

  async updateSurvey(surveyId: string, payload: SurveyPayload): Promise<Survey> {
    const data = await apiRequest<{ survey: Survey }>(`/api/surveys/${surveyId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data.survey;
  },

  async deleteSurvey(surveyId: string): Promise<void> {
    await apiRequest(`/api/surveys/${surveyId}`, {
      method: 'DELETE',
    });
  },

  async getSurveyById(surveyId: string): Promise<Survey> {
    const data = await apiRequest<{ survey: Survey }>(
      `/api/surveys/${surveyId}`,
      {},
      false
    );
    return data.survey;
  },

  async submitSurvey(surveyId: string, answers: Answer[]): Promise<void> {
    await apiRequest(
      `/api/surveys/${surveyId}/submissions`,
      {
        method: 'POST',
        body: JSON.stringify({ answers }),
      },
      false
    );
  },

  async getSurveySubmissions(surveyId: string): Promise<SurveySubmission[]> {
    const data = await apiRequest<{ submissions: SurveySubmission[] }>(
      `/api/surveys/${surveyId}/submissions`
    );
    return data.submissions;
  },
};
