import type { LegacySurvey, Survey, SurveySubmission } from '../types/survey.types';
import type { StoredUser, User } from '../types/auth.types';
import { normalizeSurvey } from '../utils/surveyUtils';

const KEYS = {
  USERS: 'survey_master_users',
  SURVEYS: 'survey_master_surveys',
  SUBMISSIONS: 'survey_master_submissions',
  CURRENT_USER: 'survey_master_user',
  TOKEN: 'survey_token',
};

export const StorageService = {
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  },

  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return defaultValue;
    }
  },

  // --- משתמשים רשומים ---

  getUsers: (): StoredUser[] => {
    return StorageService.get<StoredUser[]>(KEYS.USERS, []);
  },

  saveUser: (user: StoredUser): void => {
    const users = StorageService.getUsers();
    users.push(user);
    StorageService.save(KEYS.USERS, users);
  },

  findUserByEmail: (email: string): StoredUser | undefined => {
    const normalizedEmail = email.trim().toLowerCase();
    return StorageService.getUsers().find((user) => user.email === normalizedEmail);
  },

  // --- אימות (סשן מקומי) ---

  getToken: (): string | null => {
    return localStorage.getItem(KEYS.TOKEN);
  },

  setAuth: (user: User): void => {
    StorageService.save(KEYS.CURRENT_USER, user);
    localStorage.setItem(KEYS.TOKEN, `local-${user.id}`);
  },

  getCurrentUser: (): User | null => {
    return StorageService.get<User | null>(KEYS.CURRENT_USER, null);
  },

  logout: (): void => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.TOKEN);
  },

  isLoggedIn: (): boolean => {
    return Boolean(StorageService.getToken() && StorageService.getCurrentUser());
  },

  // --- סקרים ---

  getSurveys: (): Survey[] => {
    const raw = StorageService.get<LegacySurvey[]>(KEYS.SURVEYS, []);
    return raw.map(normalizeSurvey);
  },

  saveSurvey: (survey: Survey): void => {
    const surveys = StorageService.getSurveys();
    const index = surveys.findIndex((s) => s.id === survey.id);

    if (index !== -1) {
      surveys[index] = survey;
    } else {
      surveys.push(survey);
    }

    StorageService.save(KEYS.SURVEYS, surveys);
  },

  getSurveyById: (id: string): Survey | undefined => {
    const raw = StorageService.get<LegacySurvey[]>(KEYS.SURVEYS, []);
    const found = raw.find((s) => s.id === id);
    return found ? normalizeSurvey(found) : undefined;
  },

  getSurveysByUser: (userId: string): Survey[] => {
    const surveys = StorageService.getSurveys();
    return surveys.filter((survey) => survey.createdBy === userId);
  },

  deleteSurvey: (surveyId: string): void => {
    const surveys = StorageService.getSurveys().filter((survey) => survey.id !== surveyId);
    StorageService.save(KEYS.SURVEYS, surveys);

    const submissions = StorageService.getSubmissions().filter(
      (submission) => submission.surveyId !== surveyId
    );
    StorageService.save(KEYS.SUBMISSIONS, submissions);
  },

  isSurveyOwner: (surveyId: string, userId: string): boolean => {
    const survey = StorageService.getSurveyById(surveyId);
    return survey?.createdBy === userId;
  },

  // --- תשובות ---

  getSubmissions: (): SurveySubmission[] => {
    return StorageService.get<SurveySubmission[]>(KEYS.SUBMISSIONS, []);
  },

  saveSubmission: (submission: SurveySubmission): void => {
    const submissions = StorageService.getSubmissions();
    submissions.push(submission);
    StorageService.save(KEYS.SUBMISSIONS, submissions);
  },

  getAnswersForSurvey: (surveyId: string): SurveySubmission[] => {
    const submissions = StorageService.getSubmissions();
    return submissions.filter((sub) => sub.surveyId === surveyId);
  },
};
