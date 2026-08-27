export interface FaqItem {
  id: number;
  title: string;
  answer: string;
}

export interface FaqResponse {
  data: FaqItem[];
}