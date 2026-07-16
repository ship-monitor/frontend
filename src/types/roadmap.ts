export interface RoadmapItem {
  id: number;
  stage_name: string;
  stage_description: string;
  stage_date: string;
}

export interface RoadmapResponse {
  data: RoadmapItem[];
}
