import type { LegacySurvey, Question, Section, Survey } from '../types/survey.types';

export function normalizeSurvey(raw: LegacySurvey): Survey {
  if (raw.sections && raw.sections.length > 0) {
    return raw as Survey;
  }

  const legacyQuestions = raw.questions ?? [];

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    sections: [
      {
        id: crypto.randomUUID(),
        title: 'כללי',
        description: '',
        questions: legacyQuestions,
      },
    ],
    createdBy: raw.createdBy,
    createdAt: raw.createdAt,
  };
}

export function getAllQuestions(survey: Survey | LegacySurvey): Question[] {
  const normalized = normalizeSurvey(survey);
  return normalized.sections.flatMap((section) => section.questions);
}

export function getTotalQuestionCount(survey: Survey | LegacySurvey): number {
  return getAllQuestions(survey).length;
}

export function getTotalSectionCount(survey: Survey | LegacySurvey): number {
  return normalizeSurvey(survey).sections.length;
}

export function createEmptyQuestion(): Question {
  return {
    id: crypto.randomUUID(),
    type: 'open',
    title: '',
    isRequired: false,
  };
}

export function createEmptySection(): Section {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    questions: [createEmptyQuestion()],
  };
}
