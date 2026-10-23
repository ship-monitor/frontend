export interface FaqTranslation {
  languages_code: string;
  title?: string | null;
  answer?: string | null;
}

export interface FaqItem {
  id: number;
  title: string;
  answer: string;
  translations?: FaqTranslation[];
}

export interface FaqResponse {
  data: FaqItem[];
}
