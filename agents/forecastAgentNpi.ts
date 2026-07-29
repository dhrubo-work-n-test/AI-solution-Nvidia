import { generateStructuredJson } from "./client.js";

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
}

export async function runForecastNpi(params: {
  productName: string;
  selectedPrimaryModel: string;
  marketAdoptionRate: "High" | "Moderate" | "Conservative";
}): Promise<ForecastNpiResult> {
  const { productName, selectedPrimaryModel, marketAdoptionRate } = params;

  const prompt = `
    You are the NVIDIA New Product Introduction (NPI) Forecast Agent. We are establishing the baseline forecast for a next-generation architecture: ${productName}.
    User Preferred Primary Model: ${selectedPrimaryModel}
    Simulated Market Adoption Speed: ${marketAdoptionRate}

    Tasks:
    1. Run a Champion-Challenger Model Selection. Compare Trend Extrapolation Model (statistical baseline), Multi-Variable Analytics Model (non-linear trend model), and Pattern-Recognition Model (recurrent pattern sequence model).
       - Calculate MAPE (Mean Absolute Percentage Error) for each model.
       - Select the Champion model based on accuracy and user choice.
    2. Construct Hierarchical Forecast. Break down the target product's launch quarter requirements across Regions (North America, APAC, EMEA) and Customers (Hyperscale Cloud, Enterprise OEM, Government & Research).
    3. Identify Low Confidence Planning Nodes. Flag specific SKUs or customer nodes where adoption confidence is low and generate structural warnings.
    4. Return reasoning steps, detailed model metrics, hierarchical forecasts, flags, and timestamped activity logs.

    Format the response as a JSON object with:
    - reasoningSteps: array of strings
    - championModel: string
    - challengerModels: array of strings
    - modelMetrics: array of { modelName: string, mape: number, status: string }
    - hierarchicalForecast: array of { node: string, naUnits: number, apacUnits: number, emeaUnits: number }
    - lowConfidenceFlags: array of { skuNode: string, confidenceScore: number, reason: string }
    - confidenceScore: number (0-100)
    - keyFactors: array of strings
    - humanActionRequired: string
    - activityLogs: array of strings
  `;

  // Dynamic calculations based on user input for fallback
  const baseMultiplier = marketAdoptionRate === "High" ? 1.4 : marketAdoptionRate === "Conservative" ? 0.75 : 1.0;
  
  const modelMetrics: ModelMetric[] = [
    { 
      modelName: "Pattern-Recognition Model", 
      mape: 4.8, 
      status: (selectedPrimaryModel.includes("Pattern") || selectedPrimaryModel.includes("LSTM")) ? "Selected Champion" : "Challenger" 
    },
    { 
      modelName: "Multi-Variable Analytics Model", 
      mape: 5.6, 
      status: (selectedPrimaryModel.includes("Multi") || selectedPrimaryModel.includes("XGBoost")) ? "Selected Champion" : "Challenger" 
    },
    { 
      modelName: "Trend Extrapolation Model", 
      mape: 9.2, 
      status: (selectedPrimaryModel.includes("Trend") || selectedPrimaryModel.includes("ARIMA")) ? "Selected Champion" : "Challenger" 
    }
  ];

  // Sort so selected model is marked appropriately or highlight champion
  const championModel = selectedPrimaryModel || "Pattern-Recognition Model";

  const hierarchicalForecast: HierarchicalForecastNode[] = [
    { node: "Hyperscale Cloud Providers", naUnits: Math.round(14500 * baseMultiplier), apacUnits: Math.round(11200 * baseMultiplier), emeaUnits: Math.round(9800 * baseMultiplier) },
    { node: "Enterprise OEM (Dell, HPE, Supermicro)", naUnits: Math.round(8200 * baseMultiplier), apacUnits: Math.round(6400 * baseMultiplier), emeaUnits: Math.round(5900 * baseMultiplier) },
    { node: "Government & National Labs", naUnits: Math.round(3400 * baseMultiplier), apacUnits: Math.round(1500 * baseMultiplier), emeaUnits: Math.round(2800 * baseMultiplier) }
  ];

  const lowConfidenceFlags: LowConfidenceFlag[] = [
    { skuNode: "EMEA Gov Cluster Node 4B", confidenceScore: 68, reason: "Strict local sovereign data center export policy delays impact supply validation schedules." },
    { skuNode: "APAC OEM Liquid Cooled SKU C9", confidenceScore: 72, reason: "Sourcing bottleneck for specialized quick-release cooling manifolds." }
  ];

  const fallback: ForecastNpiResult = {
    reasoningSteps: [
      `Initializing NPI champion-challenger pipeline for next-generation architecture: ${productName}.`,
      `Evaluating model metrics across historic hardware release training targets.`,
      `User requested primary algorithm model selection: ${selectedPrimaryModel}.`,
      `Applying market adoption multiplier of ${baseMultiplier} based on: ${marketAdoptionRate} adoption speed.`,
      `Hierarchical geographic distribution computed across Hyperscale, OEM, and Public sectors.`
    ],
    championModel,
    challengerModels: ["Multi-Variable Analytics Model", "Trend Extrapolation Model"],
    modelMetrics,
    hierarchicalForecast,
    lowConfidenceFlags,
    confidenceScore: Math.round(89 * (baseMultiplier > 1 ? 0.95 : 1)),
    keyFactors: [
      `Selected forecast architecture: ${championModel}`,
      `Market adoption target speed set to: ${marketAdoptionRate}`,
      "Sovereign datacenter export regulations",
      "Liquid cooling hardware supply constraints"
    ],
    humanActionRequired: `Approve the initial NPI ramp manufacturing allocation of ${Math.round(65200 * baseMultiplier).toLocaleString()} units and authorize component sourcing overrides for EMEA sovereign cloud nodes.`,
    activityLogs: [
      `[01:00:33] NPI validation pipeline opened for model: ${productName}`,
      `[01:00:34] Comparing error models (Trend Extrapolation MAPE: 9.2% | Multi-Variable Analytics MAPE: 5.6% | Pattern-Recognition MAPE: 4.8%)`,
      `[01:00:35] Concluding Champion algorithm selection as: ${championModel}`,
      `[01:00:35] Hierarchical distribution matrix populated under ${marketAdoptionRate} adoption vector`
    ]
  };

  const systemInstruction = "You are an expert NVIDIA NPI planner specializing in data science, champion-challenger testing, and hierarchical supply chains. You must output valid, well-structured JSON matching the requested schema exactly.";

  return generateStructuredJson<ForecastNpiResult>(prompt, systemInstruction, fallback);
}
