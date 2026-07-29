export interface FailureCauseBreakdown {
  cause: string;
  percentage: number;
  severity: "High" | "Medium" | "Low";
  impactDescription: string;
  recommendation: string;
}

export interface RepairabilityYieldItem {
  component: string;
  repairYieldPct: number;
  avgTatHours: number;
  recommendation: string;
}

export interface RmaTriageResult {
  reasoningSteps: string[];
  solvabilityRecommendation: string;
  warrantyStatus: string;
  warrantyDetails: string;
  disposition: "Self-Troubleshoot" | "Factory Refurbish" | "Direct Replacement";
  confidenceScore: number;
  keyFactors: string[];
  replenishmentTriggered: boolean;
  humanActionRequired: string;
  activityLogs: string[];
  isSimulated?: boolean;
  
  // RMA Optimization & Failure/Repair Analysis additions
  softwareResolution?: string;
  firmwareRecommendation?: string;
  driverRecommendation?: string;
  configurationRecommendation?: string;
  environmentalRecommendation?: string;
  knowledgeBaseMatch?: string;
  businessImpactUsd?: string;
  failureRepairAnalysis?: {
    failureRateAfrPct: number;
    mtbfHours: number;
    failureRateTrend: string;
    repairabilityRatePct: number;
    firstTimeFixRatePct: number;
    avgRepairTatDays: number;
    salvageSavingsUsd: number;
    topFailureCauses: FailureCauseBreakdown[];
    repairYieldByComponent: RepairabilityYieldItem[];
    rmaProcessImpactSummary: string;
  };
}

export interface NvSentinelNode {
  id: string;
  clusterName: string;
  dataCenterLocation: string;
  nodeType: string;
  serialNumber: string;
  healthScore: number;
  warrantyStatus: "Under Warranty (36M)" | "Out of Warranty" | "Enterprise Care Premium";
  predictedFailureTimeHours: number;
  imminentFailureReason: string;
  recommendedAction: "Dispatch Replacement (Warranty)" | "Schedule Proactive Repair" | "Notify Operations Lead";
  telemetryMetrics: {
    junctionTempC: number;
    voltageRippleMv: number;
    fanSpeedRpm: number;
    pcieEccErrorsSec: number;
  };
  historicalTrend: { day: string; temp: number; voltage: number; health: number }[];
}

export interface DemandSensingChartData {
  week: string;
  statisticalBaseline: number;
  aiReforecast: number;
  rawSignal: number;
}

export interface DemandSensingResult {
  reasoningSteps: string[];
  anomalyDetected: boolean;
  anomalyAnalysis: string;
  reforecastSummary: string;
  chartData: DemandSensingChartData[];
  confidenceScore: number;
  keyFactors: string[];
  humanActionRequired: string;
  activityLogs: string[];
  isSimulated?: boolean;
}

export interface ForecastDataPoint {
  week: string;
  baseForecast: number;
  consensusForecast: number;
}

export interface DemandForecastResult {
  reasoningSteps: string[];
  decompositionTrend: string;
  decompositionSeasonal: string;
  consensusSummary: string;
  forecastData: ForecastDataPoint[];
  confidenceScore: number;
  keyFactors: string[];
  humanActionRequired: string;
  activityLogs: string[];
  isSimulated?: boolean;
}

export interface ModelMetric {
  modelName: string;
  mape: number;
  status: string;
}

export interface HierarchicalForecastNode {
  node: string;
  naUnits: number;
  apacUnits: number;
  emeaUnits: number;
}

export interface LowConfidenceFlag {
  skuNode: string;
  confidenceScore: number;
  reason: string;
  riskCategory?: string;
  rootCauseDetails?: string;
  impactOnForecast?: string;
  recommendedMitigation?: string;
}

export interface ForecastNpiResult {
  reasoningSteps: string[];
  championModel: string;
  challengerModels: string[];
  modelMetrics: ModelMetric[];
  hierarchicalForecast: HierarchicalForecastNode[];
  lowConfidenceFlags: LowConfidenceFlag[];
  confidenceScore: number;
  keyFactors: string[];
  humanActionRequired: string;
  activityLogs: string[];
  isSimulated?: boolean;
}


export interface CoordinatedAgentNode {
  agentName: string;
  assignedAction: string;
  impactWeightPct: number;
  status: string;
}

export interface OrchestratorSequenceStep {
  stepNumber: number;
  fromAgent: string;
  toAgent: string;
  messageSignal: string;
  resultDescription: string;
}

export interface OrchestratorResult {
  reasoningSteps: string[];
  mitigationPlanSummary: string;
  currentKpiValue: string;
  targetKpiValue: string;
  coordinatedAgents: CoordinatedAgentNode[];
  sequenceSteps: OrchestratorSequenceStep[];
  confidenceScore: number;
  keyFactors: string[];
  humanActionRequired: string;
  activityLogs: string[];
  isSimulated?: boolean;
}

export type ActiveTab = "orchestrator" | "rma-triage" | "nv-sentinel" | "demand-sensing" | "demand-forecast" | "forecast-npi" | "activity-log";
