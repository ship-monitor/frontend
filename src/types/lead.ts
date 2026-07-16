export interface Lead {
  id: number;
  person_name: string;
  email: string;
  phone: string;
  company_name: string;
  refrigerators_count: number;
  comment: string;
  personal_data_agreement: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeadsResponse {
  data: Lead[];
}

export interface LeadRequest {
  person_name: string;
  email: string;
  company_name: string;
  refrigerators_count: number;
  comment: string;
  personal_data_agreement: boolean;
}
