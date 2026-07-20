export type Gender = 'Laki-laki' | 'Perempuan' | 'L' | 'P';

export interface Child {
  id: string;
  name: string;
  birthDate: string; // ISO String or YYYY-MM-DD
  gender: Gender;
  nik?: string;
}

export interface Measurement {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  ageMonths: number; // Age in months at the time of measurement
  height: number; // cm
  weight: number; // kg
  headCircumference?: number; // cm, optional
  notes?: string;
  haz?: number;
  waz?: number;
  hcaz?: number;
  status_haz?: string;
  status_waz?: string;
  status_hcaz?: string;
}

export interface WHORecord {
  month: number;
  sd3neg: number;  // -3 SD (Severely Stunted)
  sd2neg: number;  // -2 SD (Stunted)
  sd1neg: number;  // -1 SD
  median: number;  // 0 SD (Median)
  sd1pos: number;  // +1 SD
  sd2pos: number;  // +2 SD
  sd3pos: number;  // +3 SD
}

export interface WHORecords {
  boys: WHORecord[];
  girls: WHORecord[];
}

export type GrowthStatus = 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi';
export type WeightStatus = 'Sangat Kurang' | 'Kurang' | 'Normal' | 'Risiko Berat Badan Lebih';

export interface PredictionIndicator {
  value: number;
  status: string;
  uncertainty_band?: number;
  haz?: number;
  waz?: number;
  hcaz?: number;
}

export interface PredictionPoint {
  age: number;
  height: PredictionIndicator;
  weight?: PredictionIndicator;
  head_circ?: PredictionIndicator;
}

export interface ModelMetrics {
  mae: number;
  r2: number;
  rmse: number;
}

export interface ModelComparisonPoint {
  age: number;
  value: number;
}

export interface PredictionResponse {
  metrics: Record<string, ModelMetrics>;
  n_history: number;
  prediction: PredictionPoint[];
  selected_model: string;
  skipped_models: string[];
  success: boolean;
  description?: string;
  version?: string;
  model_comparisons?: Record<string, ModelComparisonPoint[]>;
}
