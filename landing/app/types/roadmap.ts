export interface RoadmapTranslation {
  languages_code: string;
  stage_name?: string | null;
  stage_description?: string | null;
}

export interface RoadmapItem {
  id: number;
  stage_name: string;
  stage_description: string;
  stage_date: string;
  translations?: RoadmapTranslation[];
}

export interface RoadmapResponse {
  data: RoadmapItem[];
}
