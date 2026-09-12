export type QuizItem = {
  question: string;
  answer: string;
};

export type RecapResult = {
  summary: string;
  quiz: QuizItem[];
};

export type StudyStatus =
  | "belum-direview"
  | "sedang-dipelajari"
  | "dikuasai"
  | "perlu-diulang";

export type HistoryItem = {
  id: string;
  timestamp: number;
  preview: string;
  notes: string;
  result: RecapResult;
  status?: StudyStatus;
  pinned?: boolean;
  notebook?: string;
  tags?: string[];
  title?: string;
};

export type RatingType = "known" | "learning";
