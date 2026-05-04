export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  icdInPrescription: string;
  bhytStatus: 'valid' | 'warning' | 'risk';
  riskDetail: string;
  suggestedIcd: string;
}

export interface AnalysisResult {
  diagnosis: string;
  icdCodes: string[];
  items: PrescriptionItem[];
  summary: string;
}

export const MEDICINE_ICD_DATABASE = [
  { med: "Metformin", icds: ["E11", "E10"], note: "Đái tháo đường Tuýp 2" },
  { med: "Atorvastatin", icds: ["E78", "I25", "I10"], note: "Rối loạn lipid máu, bệnh mạch vành" },
  { med: "Amlodipine", icds: ["I10", "I15"], note: "Tăng huyết áp" },
  { med: "Esomeprazole", icds: ["K21", "K25", "K29"], note: "Trào ngược dạ dày, loét dạ dày" },
  { med: "Clopidogrel", icds: ["I25", "I63", "I70"], note: "Phòng ngừa huyết khối" },
  { med: "Salbutamol", icds: ["J45", "J44"], note: "Hen phế quản, COPD" },
  { med: "Augmentin", icds: ["J01", "J15", "J32"], note: "Nhiễm khuẩn hô hấp" },
  { med: "Gliclazide", icds: ["E11"], note: "Đái tháo đường Tuýp 2" },
  { med: "Losartan", icds: ["I10", "N08"], note: "Tăng huyết áp, bệnh thận do ĐTĐ" }
];
