import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  TrendingUp, 
  Wrench, 
  ShieldAlert, 
  Network, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  FileText, 
  ArrowRight, 
  UserCheck, 
  Terminal, 
  HelpCircle, 
  BarChart3, 
  Settings,
  ChevronRight,
  Sparkles,
  Info,
  Mail,
  Send,
  Check,
  Trash2,
  Zap,
  Server,
  Radio,
  Bell
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  ComposedChart 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { 
  ActiveTab, 
  RmaTriageResult, 
  DemandSensingResult, 
  DemandForecastResult, 
  ForecastNpiResult, 
  OrchestratorResult,
  NvSentinelNode,
  LowConfidenceFlag
} from "./types.ts";

// ==========================================
// PRESETS & SCENARIOS DATA
// ==========================================

const CUSTOMER_COMPLAINTS = [
  {
    id: "h100-fan-dust",
    label: "H100 SXM5 - Overheating & Fan Dusty",
    productName: "NVIDIA H100 SXM5 GPU",
    serialNumber: "SN-NVD-H100-983712",
    defectDescription: "Card runs hot and throttles performance down to 10% under workload. Fans are spinning slowly and display a thick coating of server-room dust. System telemetry reports junction temperature exceeding 94°C.",
    purchaseDate: "2024-04-12"
  },
  {
    id: "b200-power-fail",
    label: "Blackwell B200 PCIe - Broken Power Controller",
    productName: "NVIDIA Blackwell B200 PCIe GPU",
    serialNumber: "SN-NVD-B200-112049",
    defectDescription: "System fails power-on-self-test (POST). Diagnostics LED on board displays solid amber, pointing to a modular power phase controller failure (MOSFET breakdown). Main board silicon is pristine.",
    purchaseDate: "2025-08-20"
  },
  {
    id: "grace-hopper-hbm",
    label: "Grace Hopper - Defective HBM Module",
    productName: "NVIDIA Grace Hopper Superchip GH200",
    serialNumber: "SN-NVD-GH-409184",
    defectDescription: "Severe memory corruption reported during high-stress LLM training loops. High-Bandwidth Memory (HBM3) bank 4 reports uncorrectable ECC errors, indicating cracked physical micro-bumps on the silicon substrate.",
    purchaseDate: "2024-11-05"
  },
  {
    id: "nvlink-retimer-dropout",
    label: "NVLink Switch Tray - PCIe/NVLink Retimer Desync",
    productName: "NVIDIA NVLink Switch Tray / DGX B200",
    serialNumber: "SN-NVD-NVL-882031",
    defectDescription: "Intermittent PCIe Gen5 lane dropouts and NVLink fabric desynchronization across 8 GPU topology. Retimer firmware handshake timeouts and gold connector pin oxidation detected during 3.2 Tbps fabric stress test.",
    purchaseDate: "2025-01-15"
  },
  {
    id: "hgx-coolant-leak",
    label: "HGX B200 Liquid-Cooled - Cold Plate Manifold Seepage",
    productName: "NVIDIA HGX B200 Liquid-Cooled Board",
    serialNumber: "SN-NVD-HGX-551029",
    defectDescription: "Telemetry sensors trigger low coolant loop pressure alert. Physical inspection reveals minor dielectric fluid seepage around quick-disconnect manifold fitting #2, causing localized thermal hotspot on VRM inductors.",
    purchaseDate: "2025-03-10"
  }
];

const DEMAND_SENSING_PRESETS = [
  {
    id: "meta-llama-4",
    label: "Meta Platforms - Llama 4 Training Cluster Spike (Critical)",
    productName: "Blackwell B200 GPU",
    hyperscaler: "Meta Platforms",
    signalSpikePct: 180,
    signalVolumeUnits: 65000,
    urgencyCode: "CRITICAL"
  },
  {
    id: "azure-p5-expansion",
    label: "Microsoft Azure - EC2 p5 Instance Fleet Expansion",
    productName: "H100 SXM5 GPU",
    hyperscaler: "Microsoft Azure",
    signalSpikePct: 85,
    signalVolumeUnits: 32000,
    urgencyCode: "HIGH"
  },
  {
    id: "coreweave-sovereign",
    label: "CoreWeave - Sovereign European AI Cloud Cluster",
    productName: "Blackwell B200 Server Cabinets",
    hyperscaler: "CoreWeave Inc.",
    signalSpikePct: 140,
    signalVolumeUnits: 15000,
    urgencyCode: "HIGH"
  }
];

const DEMAND_FORECAST_PRESETS = [
  {
    id: "h100-planning",
    label: "H100 SXM5 - Quarterly Review (Standard Growth)",
    productName: "NVIDIA H100 SXM5 GPU",
    salesOverrideUnits: 6500,
    marketingOverrideUnits: -2500,
    shipmentHistoryYears: 2
  },
  {
    id: "grace-hopper-planning",
    label: "Grace Hopper - Sovereign DC Push (Heavy S&OP)",
    productName: "Grace Hopper Superchip GH200",
    salesOverrideUnits: 12000,
    marketingOverrideUnits: 4500,
    shipmentHistoryYears: 2
  }
];

const FORECAST_NPI_PRESETS = [
  {
    id: "rubin-r100",
    label: "Rubin R100 Ultra - Standard Ramp Up",
    productName: "NVIDIA Rubin R100 GPU",
    selectedPrimaryModel: "Pattern-Recognition Model",
    marketAdoptionRate: "High"
  },
  {
    id: "vera-v200",
    label: "Vera V200 platform - Conservative Entry",
    productName: "NVIDIA Vera V200 Accelerator",
    selectedPrimaryModel: "Multi-Variable Analytics Model",
    marketAdoptionRate: "Conservative"
  },
  {
    id: "gb200-nvl72",
    label: "Grace Blackwell GB200 NVL72 Platform",
    productName: "NVIDIA GB200 NVL72 System",
    selectedPrimaryModel: "Pattern-Recognition Model",
    marketAdoptionRate: "Moderate"
  }
];



const ORCHESTRATOR_PRESETS = [
  {
    id: "fill-rate-breach",
    label: "OTIF/Fill Rate Drops to 79% (EMEA Hub)",
    kpiBreachType: "Fill-Rate KPI breached at 79% (Target: >85%)",
    affectedRegion: "EMEA Logistics Center - Frankfurt",
    impactedSku: "NVIDIA H100 SXM5 Server Boards"
  },
  {
    id: "weeks-supply-spike",
    label: "Weeks-of-Supply Inventory Bloat in APAC Hub",
    kpiBreachType: "Inventory Weeks-of-Supply spiked to 18 weeks (Target: 12)",
    affectedRegion: "APAC Logistics Node - Singapore",
    impactedSku: "Blackwell B200 Accelerator Modules"
  }
];

const NV_SENTINEL_NODES: NvSentinelNode[] = [
  {
    id: "sentinel-cw-01",
    clusterName: "CoreWeave US-East Data Center - Rack 14",
    dataCenterLocation: "Ashburn, VA, USA",
    nodeType: "NVIDIA HGX B200 (8x B200 GPUs)",
    serialNumber: "SN-CW-B200-884910",
    healthScore: 68,
    warrantyStatus: "Under Warranty (36M)",
    predictedFailureTimeHours: 48,
    imminentFailureReason: "MOSFET Power Regulator Phase 3 Voltage Ripple spike (>180mV threshold). Impending thermal breakdown detected by NVSentinel telemetry.",
    recommendedAction: "Dispatch Replacement (Warranty)",
    telemetryMetrics: {
      junctionTempC: 88.4,
      voltageRippleMv: 192,
      fanSpeedRpm: 12400,
      pcieEccErrorsSec: 14.2
    },
    historicalTrend: [
      { day: "Day -6", temp: 71, voltage: 42, health: 98 },
      { day: "Day -5", temp: 73, voltage: 48, health: 96 },
      { day: "Day -4", temp: 76, voltage: 65, health: 91 },
      { day: "Day -3", temp: 80, voltage: 95, health: 84 },
      { day: "Day -2", temp: 84, voltage: 140, health: 75 },
      { day: "Day -1", temp: 88, voltage: 192, health: 68 }
    ]
  },
  {
    id: "sentinel-msft-02",
    clusterName: "Microsoft Azure West US3 - Pod 09",
    dataCenterLocation: "Phoenix, AZ, USA",
    nodeType: "NVIDIA DGX H100 SuperPOD",
    serialNumber: "SN-AZ-H100-209481",
    healthScore: 74,
    warrantyStatus: "Under Warranty (36M)",
    predictedFailureTimeHours: 96,
    imminentFailureReason: "HBM3 Stack 4 Micro-bumps degradation & rising ECC uncorrectable errors under heavy Transformer attention loops.",
    recommendedAction: "Schedule Proactive Repair",
    telemetryMetrics: {
      junctionTempC: 82.1,
      voltageRippleMv: 110,
      fanSpeedRpm: 11200,
      pcieEccErrorsSec: 28.6
    },
    historicalTrend: [
      { day: "Day -6", temp: 72, voltage: 35, health: 99 },
      { day: "Day -5", temp: 74, voltage: 40, health: 97 },
      { day: "Day -4", temp: 75, voltage: 50, health: 92 },
      { day: "Day -3", temp: 78, voltage: 75, health: 86 },
      { day: "Day -2", temp: 80, voltage: 95, health: 80 },
      { day: "Day -1", temp: 82, voltage: 110, health: 74 }
    ]
  },
  {
    id: "sentinel-meta-03",
    clusterName: "Meta Llama-4 Supercluster - Node 102",
    dataCenterLocation: "Forest City, NC, USA",
    nodeType: "NVIDIA Grace Hopper GH200",
    serialNumber: "SN-META-GH-991204",
    healthScore: 81,
    warrantyStatus: "Enterprise Care Premium",
    predictedFailureTimeHours: 120,
    imminentFailureReason: "Liquid cooling loop differential pressure drop (0.4 BAR) indicating micro-blockage in cold plate.",
    recommendedAction: "Notify Operations Lead",
    telemetryMetrics: {
      junctionTempC: 79.5,
      voltageRippleMv: 85,
      fanSpeedRpm: 9800,
      pcieEccErrorsSec: 2.1
    },
    historicalTrend: [
      { day: "Day -6", temp: 68, voltage: 25, health: 100 },
      { day: "Day -5", temp: 70, voltage: 30, health: 98 },
      { day: "Day -4", temp: 72, voltage: 42, health: 94 },
      { day: "Day -3", temp: 75, voltage: 58, health: 90 },
      { day: "Day -2", temp: 77, voltage: 72, health: 85 },
      { day: "Day -1", temp: 79, voltage: 85, health: 81 }
    ]
  }
];

// Helper to replace **text** and `code` with styled React components
function parseBold(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={idx} className="bg-[#090d16] px-1 py-0.5 rounded border border-nvidia-border/30 font-mono text-[10px] text-nvidia-green">{part.slice(1, -1)}</code>;
      }
      return <strong key={idx} className="font-semibold text-white">{part}</strong>;
    }
    
    const subParts = part.split(/`([^`]+)`/g);
    return subParts.map((sub, sidx) => {
      if (sidx % 2 === 1) {
        return <code key={sidx} className="bg-[#090d16] px-1.5 py-0.5 rounded border border-nvidia-border/30 font-mono text-[10px] text-nvidia-green">{sub}</code>;
      }
      return sub;
    });
  });
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2">
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        
        if (trimmed === "---") {
          return <hr key={idx} className="border-nvidia-border/40 my-3" />;
        }
        
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-sm font-bold text-white mb-2 mt-4 border-b border-nvidia-border pb-1.5 uppercase tracking-wide">
              {trimmed.substring(2)}
            </h2>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-xs font-bold text-white uppercase tracking-wider mb-2 mt-4">
              {trimmed.substring(3)}
            </h2>
          );
        }
        
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-xs font-bold text-nvidia-green uppercase tracking-wider mb-1.5 mt-3">
              {trimmed.substring(4)}
            </h3>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-nvidia-green select-none mt-0.5">•</span>
              <span className="flex-1">{parseBold(content)}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            const num = match[1];
            const content = match[2];
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5">
                <span className="text-nvidia-green font-mono font-bold text-[10px] select-none mt-0.5">{num}.</span>
                <span className="flex-1">{parseBold(content)}</span>
              </div>
            );
          }
        }

        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={idx} className="border-l-2 border-nvidia-green bg-nvidia-green/5 pl-3 py-1.5 rounded-r my-2 text-[11px] italic text-slate-200">
              {parseBold(trimmed.substring(2))}
            </blockquote>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx} className="leading-relaxed">{parseBold(line)}</p>;
      })}
    </div>
  );
}

function HeaderWithInfo({ title, tooltip, subtitle }: { title: string; tooltip: string; subtitle?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-white text-base">{title}</h3>
        <div 
          className="relative inline-flex items-center justify-center cursor-help text-slate-400 hover:text-nvidia-green transition-colors bg-slate-800/80 hover:bg-nvidia-green/10 p-1 rounded-full border border-nvidia-border/60"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Info className="h-3.5 w-3.5" />
          {hovered && (
            <div className="absolute z-50 left-0 top-full mt-2 w-72 sm:w-80 bg-[#0d1320] border border-nvidia-border rounded-lg p-3 text-xs text-slate-200 leading-relaxed shadow-xl shadow-black/90 font-sans pointer-events-none animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="absolute border-4 border-transparent border-b-[#0d1320] -top-2 left-3"></div>
              <div className="font-semibold text-nvidia-green font-mono text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>What Happens Here</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px] leading-relaxed">{tooltip}</p>
            </div>
          )}
        </div>
      </div>
      {subtitle && <p className="text-xs text-nvidia-gray">{subtitle}</p>}
    </div>
  );
}

function HoverFieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative flex items-center gap-1.5 group select-none">
      <span className="text-xs font-mono text-slate-300 transition-colors group-hover:text-nvidia-green">{label}</span>
      <div 
        className="cursor-help text-neutral-500 hover:text-nvidia-green transition-colors"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Info className="h-3 w-3" />
      </div>
      {hovered && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-[#0d1320] border border-nvidia-border/80 rounded p-2 text-[11px] text-slate-200 leading-normal shadow-lg shadow-black/80 font-sans pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="absolute border-4 border-transparent border-t-[#0d1320] -bottom-2 left-3"></div>
          {tooltip}
        </div>
      )}
    </div>
  );
}

function HoverKpiCard({ 
  label, 
  value, 
  subText, 
  tooltip, 
  accentColor = "text-white" 
}: { 
  label: string; 
  value: string; 
  subText?: React.ReactNode; 
  tooltip: string; 
  accentColor?: string; 
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      className="relative bg-nvidia-card border border-nvidia-border hover:border-nvidia-green/40 transition-all duration-150 rounded-lg p-3 flex flex-col group select-none cursor-help"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] font-mono text-slate-400 group-hover:text-nvidia-green transition-colors uppercase tracking-wider">{label}</span>
        <Info className="h-2.5 w-2.5 text-neutral-500 group-hover:text-nvidia-green transition-colors" />
      </div>
      <strong className={`${accentColor} text-lg font-bold mt-1`}>{value}</strong>
      {subText && <div className="mt-1">{subText}</div>}
      
      {hovered && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-[#0d1320] border border-nvidia-border rounded p-2.5 text-[11px] text-slate-200 leading-normal shadow-lg shadow-black/80 font-sans pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="absolute border-4 border-transparent border-t-[#0d1320] -bottom-2 left-4"></div>
          <div className="font-semibold text-nvidia-green font-mono text-[9px] uppercase tracking-wider mb-0.5">{label} KPI</div>
          {tooltip}
        </div>
      )}
    </div>
  );
}

function HoverModelTag({ name, description, isActive }: { name: string; description: string; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      className={`relative px-2.5 py-1.5 rounded border text-left transition-all cursor-help flex items-center justify-between gap-1.5 select-none ${
        isActive 
          ? "bg-nvidia-green/10 border-nvidia-green text-white font-semibold" 
          : "bg-[#090d16] border-nvidia-border/70 text-slate-400 hover:text-slate-200 hover:border-nvidia-green/40"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Info className={`h-3 w-3 shrink-0 ${isActive ? "text-nvidia-green" : "text-slate-500"}`} />
        <span className="text-[10px] font-mono truncate">{name}</span>
      </div>

      {hovered && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 sm:w-72 bg-[#0d1320] border border-nvidia-border rounded-lg p-2.5 text-[11px] text-slate-200 leading-normal shadow-xl shadow-black/90 font-sans pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="absolute border-4 border-transparent border-t-[#0d1320] -bottom-2 left-4"></div>
          <div className="font-semibold text-nvidia-green font-mono text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Info className="h-2.5 w-2.5" />
            <span>{name}</span>
          </div>
          <p className="text-slate-300 font-sans text-[11px] leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
}

function HoverModelMetricCard({ m }: { m: { modelName: string; mape: number; status: string } }) {
  const [hovered, setHovered] = useState(false);
  const tooltips: Record<string, string> = {
    "Pattern-Recognition Model": "Deep neural sequence model (LSTM) that identifies complex adoption patterns, non-linear demand spikes, and multi-stage launch cycles.",
    "Multi-Variable Analytics Model": "Tree-ensemble model (XGBoost) that evaluates multiple external variables simultaneously, such as macro indicators, pricing tiers, marketing spend, and competitor launches.",
    "Trend Extrapolation Model": "Classical statistical time-series model (ARIMA) that extends historical sales baselines, autocorrelation, and linear growth trajectories."
  };

  const matchedKey = Object.keys(tooltips).find(k => m.modelName.includes(k) || k.includes(m.modelName)) || "";
  const desc = tooltips[m.modelName] || tooltips[matchedKey] || "Statistical forecasting model accuracy metrics evaluated during validation training phases.";

  return (
    <div 
      className={`relative p-2.5 rounded border transition-colors select-none cursor-help ${
        m.status.toLowerCase().includes("champion") || m.status.toLowerCase().includes("selected")
          ? "bg-nvidia-green/10 border-nvidia-green text-white" 
          : "bg-[#090d16] border-nvidia-border text-slate-400 hover:border-nvidia-green/30"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span className="block text-[10px] font-mono text-nvidia-gray">{m.status.toUpperCase()}</span>
        <Info className="h-2.5 w-2.5 text-neutral-500" />
      </div>
      <strong className="block truncate text-white">{m.modelName}</strong>
      <div className="mt-1 font-mono text-base font-bold text-white">{m.mape}% MAPE</div>

      {hovered && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-[#0d1320] border border-nvidia-border rounded p-2.5 text-[11px] text-slate-200 leading-normal shadow-lg shadow-black/80 font-sans pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="absolute border-4 border-transparent border-t-[#0d1320] -bottom-2 left-4"></div>
          <div className="font-semibold text-nvidia-green font-mono text-[9px] uppercase tracking-wider mb-0.5">{m.modelName}</div>
          {desc}
        </div>
      )}
    </div>
  );
}

function MapeInfoPopover() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-nvidia-green/10 border border-nvidia-green/30 text-nvidia-green text-[10px] font-mono hover:bg-nvidia-green/20 transition-all cursor-help"
      >
        <Info className="h-3 w-3" />
        <span>What is MAPE?</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 sm:w-80 bg-[#0d1320] border border-nvidia-border rounded-lg p-3 text-[11px] text-slate-200 leading-normal shadow-2xl shadow-black/90 font-sans pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="absolute border-4 border-transparent border-t-[#0d1320] -bottom-2 left-4"></div>
          <div className="flex items-center gap-1.5 text-nvidia-green font-mono font-semibold text-[10px] uppercase tracking-wider mb-1.5 border-b border-nvidia-border/60 pb-1">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>MAPE KPI Explainability</span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <p>
              <strong className="text-white">MAPE (Mean Absolute Percentage Error)</strong> measures average forecast inaccuracy as an absolute percentage of actual demand outcomes.
            </p>
            <div className="bg-[#05080e] p-1.5 rounded border border-nvidia-border/50 text-[10px] font-mono text-nvidia-green text-center">
              MAPE = (1/n) × Σ |(Actual - Forecast) / Actual| × 100%
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Why used in NPI:</strong> New silicon architectures have no pre-existing sales history. MAPE normalizes error percentages across drastically different shipment scale hubs (e.g. 15,000 Hyperscale units vs 1,500 Government units), allowing fair Champion model selection without scale bias.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AllocationsInfoPopover() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-nvidia-green/10 border border-nvidia-green/30 text-nvidia-green text-[10px] font-mono hover:bg-nvidia-green/20 transition-all cursor-help"
      >
        <Info className="h-3 w-3" />
        <span>Allocation Explainability</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 sm:w-80 bg-[#0d1320] border border-nvidia-border rounded-lg p-3 text-[11px] text-slate-200 leading-normal shadow-2xl shadow-black/90 font-sans pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="absolute border-4 border-transparent border-t-[#0d1320] -bottom-2 left-4"></div>
          <div className="flex items-center gap-1.5 text-nvidia-green font-mono font-semibold text-[10px] uppercase tracking-wider mb-1.5 border-b border-nvidia-border/60 pb-1">
            <Layers className="h-3.5 w-3.5" />
            <span>Hierarchical Allocations Line Chart</span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <p>
              This line chart displays <strong className="text-white font-mono">disaggregated regional target allocations</strong> across Customer Node tiers (Hyperscale, Enterprise OEM, Government).
            </p>
            <ul className="list-disc pl-3 text-[10px] space-y-1 text-slate-300">
              <li><strong className="text-nvidia-green">North America Hub:</strong> Highest initial volume driven by Tier-1 hyperscale cloud datacenters.</li>
              <li><strong className="text-cyan-400">APAC Hub:</strong> High OEM server manufacturer ramp (Dell, Supermicro, Foxconn assembly).</li>
              <li><strong className="text-amber-400">EMEA Hub:</strong> Specialized sovereign cloud & national research laboratory allocations.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function LowConfidenceExplainabilityCard({ f }: { f: LowConfidenceFlag }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-[#12080a] border border-rose-500/30 hover:border-rose-500/60 rounded-lg p-3.5 text-xs flex flex-col gap-2.5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <div>
            <strong className="text-rose-300 font-mono text-xs block">{f.skuNode}</strong>
            {f.riskCategory && (
              <span className="text-[10px] font-mono text-rose-400/80 bg-rose-950/60 border border-rose-500/20 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                {f.riskCategory}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold px-2 py-0.5 font-mono rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            {f.confidenceScore}% Confidence
          </span>
        </div>
      </div>

      {/* Main Warning Reason */}
      <p className="text-slate-200 font-sans text-[11px] leading-relaxed">
        <strong className="text-rose-300">Primary Warning:</strong> {f.reason}
      </p>

      {/* Why Flagged Low Confidence Section */}
      <div className="bg-[#0b0406] border border-rose-900/40 rounded p-2.5 text-[11px] flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>Why Flagged Low Confidence? (Root Cause & Model Analysis)</span>
          </span>
          <button 
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] text-slate-400 hover:text-white underline font-mono cursor-pointer"
          >
            {showDetails ? "Collapse Analysis" : "Expand Explainability Details"}
          </button>
        </div>
        <p className="text-slate-300 leading-normal text-[11px]">
          {f.rootCauseDetails || f.reason}
        </p>
        {showDetails && (
          <div className="mt-1.5 pt-1.5 border-t border-rose-900/30 text-[10px] text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Confidence Threshold Trigger:</span>
              <span className="text-rose-300">&lt; 80% (NVIDIA NPI Governance Protocol)</span>
            </div>
            <div className="flex justify-between">
              <span>Primary Driver:</span>
              <span className="text-rose-300">{f.riskCategory || "Supply & Volatility Risk"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Impact & Mitigation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        {f.impactOnForecast && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2">
            <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-semibold mb-0.5">Forecast Impact Potential</span>
            <span className="text-slate-200">{f.impactOnForecast}</span>
          </div>
        )}
        {f.recommendedMitigation && (
          <div className="bg-nvidia-green/10 border border-nvidia-green/20 rounded p-2">
            <span className="text-[9px] font-mono text-nvidia-green uppercase tracking-wider block font-semibold mb-0.5">AI Recommended Mitigation</span>
            <span className="text-slate-200">{f.recommendedMitigation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SupplyChainGlossary() {
  const [activeCategory, setActiveCategory] = useState<"all" | "kpis" | "terms" | "modules">("all");

  const terms = [
    {
      term: "Control Tower Dashboard (Orchestrator)",
      definition: "The central control plane. It aggregates global logistics telemetry, safety buffer levels, and manufacturing health, automatically invoking multi-agent joint actions when thresholds are violated.",
      type: "modules"
    },
    {
      term: "RMA Triage & Warranty Validation",
      definition: "Automates the ingest of customer warranty claims. Scans purchase dates against standard 3-year term limits, evaluates Defect Diagnosis logs with LLM agents, and outputs optimized repair or replacement disposition paths.",
      type: "modules"
    },
    {
      term: "Demand Sensing Agent",
      definition: "Analyzes rolling real-time customer purchase signals, telemetry logs, and market disruptions to detect volume anomalies or sudden pull-forward orders from cloud hyperscalers, adjusting immediate schedules dynamically.",
      type: "modules"
    },
    {
      term: "Consensus S&OP Forecasting",
      definition: "Performs seasonal multiplicative decomposition over long-term shipment history (up to 3 years) and fuses regional sales and marketing team adjustments into a balanced, consensus corporate demand plan.",
      type: "modules"
    },
    {
      term: "NPI Ramp-Up Forecasting",
      definition: "Addresses supply chain cold-start challenges for newly launched products. Competes advanced machine learning models (LSTM, XGBoost, and ARIMA) to dynamically forecast SKU ramp structures and highlight risky nodes.",
      type: "modules"
    },

    {
      term: "RMA (Return Merchandise Authorization)",
      definition: "The authorized transaction process allowing an enterprise customer to ship defective or end-of-lifecycle hardware back to Nvidia for evaluation, component salvaging, or swap-out replacement.",
      type: "terms"
    },
    {
      term: "CBA (Cost-Benefit Analysis)",
      definition: "The optimization model comparing the financial feasibility of factory component repair/rework versus direct scrap-and-replace replenishment.",
      type: "terms"
    },
    {
      term: "S&OP (Sales & Operations Planning)",
      definition: "A cross-functional corporate planning process that balances demand, manufacturing capacity, logistics speed, and financial targets to form an unified consensus operational plan.",
      type: "terms"
    },
    {
      term: "NPI (New Product Introduction)",
      definition: "The systematic commercialization process of introducing next-generation hardware architectures (such as Rubin, Blackwell) into the supply chain ecosystem with zero initial historical data.",
      type: "terms"
    },
    {
      term: "MAPE (Mean Absolute Percentage Error)",
      definition: "The industry-standard metric for forecasting accuracy, measuring the average absolute percentage difference between predicted and actual units. Formula: Mean(|Actual - Forecast| / Actual).",
      type: "terms"
    },
    {
      term: "Pattern-Recognition Model (LSTM Sequence)",
      definition: "Deep neural sequence model that learns complex temporal sequences, market adoption patterns, and non-linear seasonal signatures across NPI launch phases.",
      type: "terms"
    },
    {
      term: "Multi-Variable Analytics Model (XGBoost)",
      definition: "A highly efficient gradient-boosted decision tree algorithm evaluating multiple external variables simultaneously, such as macro indicators, price tiering, and competitor launches.",
      type: "terms"
    },
    {
      term: "Trend Extrapolation Model (ARIMA Baseline)",
      definition: "A classical statistical time-series forecasting algorithm extending historical sales baselines, autocorrelation, and linear growth trajectories.",
      type: "terms"
    },
    {
      term: "TAT (Turnaround Time)",
      definition: "The total latency elapsed from when a physical unit is received at a triage facility until it is successfully repaired/swapped and dispatched back to the customer.",
      type: "terms"
    },
    {
      term: "Bullwhip Effect",
      definition: "A supply chain phenomenon where minor shifts in customer demand cause progressively larger swings in inventory forecasts further up the supply chain, leading to severe stockouts or excessive overproduction.",
      type: "terms"
    },
    {
      term: "Global Fill Rate (Orchestrator KPI)",
      definition: "Measures the capability of our logistics network to fulfill incoming orders instantly from on-hand safety stock without introducing backorders or shipping delays. Target: 99.0%.",
      type: "kpis"
    },
    {
      term: "Consensus MAPE (Orchestrator KPI)",
      definition: "The aggregated out-of-sample forecast error of our S&OP consensus planning, reflecting how closely our unified operational forecast matches eventual real-world shipment results.",
      type: "kpis"
    },
    {
      term: "RMA Cycle TAT (Orchestrator KPI)",
      definition: "Tracks the average turnaround time of processing customer returns, evaluating triage efficiency and service contract (SLA) conformance.",
      type: "kpis"
    },
    {
      term: "Factory Board Yield (Orchestrator KPI)",
      definition: "The ratio of fully functional high-precision hardware boards passing cleanroom physical diagnostic validation tests directly after fabrication. Units that fail undergo multi-layer rework salvaging.",
      type: "kpis"
    },
    {
      term: "S&OP Consensus Score (S&OP KPI)",
      definition: "Represents the mathematical level of agreement between statistical historical forecasts and regional sales and marketing modifications. Expressed as a percentage.",
      type: "kpis"
    },
    {
      term: "Tested Models MAPE (NPI KPI)",
      definition: "Measures and contrasts the historical validation accuracy of LSTM, XGBoost, and ARIMA on similar proxy architectures to pick the model with lowest error.",
      type: "kpis"
    },

  ];

  const filtered = activeCategory === "all" ? terms : terms.filter(t => t.type === activeCategory);

  return (
    <div className="bg-[#090d16] border border-nvidia-border/80 rounded-lg p-4 mt-4 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-nvidia-border/50 pb-3 gap-2">
        <div>
          <span className="text-[9px] font-mono text-nvidia-green uppercase tracking-wider font-bold">Interactive Reference Manual</span>
          <h4 className="font-bold text-white text-sm">Supply Chain Logistics & KPI Glossary</h4>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-1">
          {(["all", "kpis", "terms", "modules"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-nvidia-green/15 border-nvidia-green text-nvidia-green font-bold"
                  : "bg-black/40 border-nvidia-border/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto terminal-scroll pr-1.5">
        {filtered.map((item, idx) => (
          <div key={idx} className="bg-nvidia-card/40 border border-nvidia-border/50 hover:border-nvidia-green/25 p-3 rounded transition-all flex flex-col gap-1.5 group animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 group-hover:text-nvidia-green transition-colors text-[12px] font-sans">
                {item.term}
              </span>
              <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                item.type === "kpis" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                item.type === "terms" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25" :
                "bg-blue-500/10 text-blue-400 border border-blue-500/25"
              }`}>
                {item.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-normal">
              {item.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("orchestrator");
  const [controlTowerSubTab, setControlTowerSubTab] = useState<"forecasts" | "rma">("rma");
  const [activeTabStatus, setActiveTabStatus] = useState<Record<ActiveTab, "idle" | "running" | "done" | "error">>({
    orchestrator: "idle",
    "rma-triage": "done", // start pre-loaded or run once
    "nv-sentinel": "idle",
    "demand-sensing": "idle",
    "demand-forecast": "idle",
    "forecast-npi": "idle",
    "activity-log": "idle"
  });

  // NVSentinel Tracking and Monitoring State
  const [sentinelSelectedNodeId, setSentinelSelectedNodeId] = useState<string>("sentinel-cw-01");
  const [sentinelProactiveActionStatus, setSentinelProactiveActionStatus] = useState<Record<string, "idle" | "dispatched" | "scheduled" | "alerted">>({});
  const [sentinelActionNotification, setSentinelActionNotification] = useState<string | null>(null);

  // Current system messages showing streaming AI thoughts
  const [terminalFeed, setTerminalFeed] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // States for dynamic UI inputs & results
  // RMA Triage
  const [rmaSelectedComplaint, setRmaSelectedComplaint] = useState<any>(null);
  const [rmaResult, setRmaResult] = useState<RmaTriageResult | null>(null);

  // RMA Human-in-the-Loop Workflow States
  const [rmaApprovalStatus, setRmaApprovalStatus] = useState<"pending" | "approved" | "overridden" | "escalated" | null>(null);
  const [rmaOverrideDisposition, setRmaOverrideDisposition] = useState<"Self-Troubleshoot" | "Factory Refurbish" | "Direct Replacement">("Self-Troubleshoot");
  const [rmaEscalationNotes, setRmaEscalationNotes] = useState("");
  const [designatedEmail, setDesignatedEmail] = useState("");
  const [rmaDocumentText, setRmaDocumentText] = useState<string | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Demand Sensing
  const [sensingSelectedPreset, setSensingSelectedPreset] = useState(DEMAND_SENSING_PRESETS[0].id);
  const [sensingProductName, setSensingProductName] = useState(DEMAND_SENSING_PRESETS[0].productName);
  const [sensingHyperscaler, setSensingHyperscaler] = useState(DEMAND_SENSING_PRESETS[0].hyperscaler);
  const [sensingSpikePct, setSensingSpikePct] = useState(DEMAND_SENSING_PRESETS[0].signalSpikePct);
  const [sensingVolumeUnits, setSensingVolumeUnits] = useState(DEMAND_SENSING_PRESETS[0].signalVolumeUnits);
  const [sensingUrgency, setSensingUrgency] = useState(DEMAND_SENSING_PRESETS[0].urgencyCode);
  const [sensingResult, setSensingResult] = useState<DemandSensingResult | null>(null);

  // Demand Forecast
  const [forecastSelectedPreset, setForecastSelectedPreset] = useState(DEMAND_FORECAST_PRESETS[0].id);
  const [forecastProductName, setForecastProductName] = useState(DEMAND_FORECAST_PRESETS[0].productName);
  const [forecastSalesOverride, setForecastSalesOverride] = useState(DEMAND_FORECAST_PRESETS[0].salesOverrideUnits);
  const [forecastMarketingOverride, setForecastMarketingOverride] = useState(DEMAND_FORECAST_PRESETS[0].marketingOverrideUnits);
  const [forecastHistoryYears, setForecastHistoryYears] = useState(DEMAND_FORECAST_PRESETS[0].shipmentHistoryYears);
  const [forecastResult, setForecastResult] = useState<DemandForecastResult | null>(null);
  const [planningMode, setPlanningMode] = useState<"sop" | "npi">("sop");

  // Forecast NPI
  const [npiSelectedPreset, setNpiSelectedPreset] = useState(FORECAST_NPI_PRESETS[0].id);
  const [npiProductName, setNpiProductName] = useState(FORECAST_NPI_PRESETS[0].productName);
  const [npiSelectedModel, setNpiSelectedModel] = useState(FORECAST_NPI_PRESETS[0].selectedPrimaryModel);
  const [npiAdoptionRate, setNpiAdoptionRate] = useState<"High" | "Moderate" | "Conservative">(FORECAST_NPI_PRESETS[0].marketAdoptionRate as any);
  const [npiResult, setNpiResult] = useState<ForecastNpiResult | null>(null);

  // Enterprise Escalations & Manual Overrides States
  const [escalationsList, setEscalationsList] = useState([
    { id: "ESC-8921", sku: "H100 SXM5 80GB", region: "NA-WEST", severity: "HIGH", status: "PENDING", description: "SLA response time exceeding 2.5 days for Oracle Cloud cluster return." },
    { id: "ESC-8922", sku: "Blackwell B200 Board", region: "EU-CENTRAL", severity: "CRITICAL", status: "RESOLVED", description: "HBM3 memory overheating triage. Enforced bios configuration patch." },
    { id: "ESC-8923", sku: "DGX H100 System", region: "AP-NORTHEAST", severity: "MEDIUM", status: "PENDING", description: "Secondary power supply failure cluster warranty coverage query." }
  ]);
  const [newEscalationSku, setNewEscalationSku] = useState("H200 NVL");
  const [newEscalationDesc, setNewEscalationDesc] = useState("SLA breach on diagnostic triage queue.");
  const [newEscalationSeverity, setNewEscalationSeverity] = useState("HIGH");
  const [newEscalationRegion, setNewEscalationRegion] = useState("NA-EAST");

  // Dynamic Product Lifecycle & Stock Buffers State
  const [productsList, setProductsList] = useState([
    { name: "H100 SXM5 80GB", phase: "Mature S&OP", safetyStock: 92, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 12, rmaYield: 91 },
    { name: "H200 NVL PCIe 94GB", phase: "Growth Ramp", safetyStock: 85, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 10, rmaYield: 93 },
    { name: "H200 NVL PCIe", phase: "Growth Ramp", safetyStock: 74, targetStock: 100, bufferStatus: "Moderate Buffer", leadTimeWeeks: 14, rmaYield: 87 },
    { name: "H200 NVLink 141GB", phase: "Growth Ramp", safetyStock: 80, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 12, rmaYield: 92 },
    { name: "Blackwell B200 HGX", phase: "NPI Ramp", safetyStock: 42, targetStock: 100, bufferStatus: "CRITICAL LOW", leadTimeWeeks: 22, rmaYield: 94 },
    { name: "GB200 Superchip NVL72", phase: "NPI Ramp", safetyStock: 35, targetStock: 100, bufferStatus: "CRITICAL LOW", leadTimeWeeks: 26, rmaYield: 95 },
    { name: "DGX SuperPOD B200", phase: "NPI Ramp", safetyStock: 25, targetStock: 100, bufferStatus: "CRITICAL LOW", leadTimeWeeks: 24, rmaYield: 91 },
    { name: "Rubin Ultra Module", phase: "Concept / NPI Planning", safetyStock: 0, targetStock: 100, bufferStatus: "Pre-Launch Zero Stock", leadTimeWeeks: 38, rmaYield: 100 },
    { name: "Rubin R100 GPU", phase: "Concept / NPI Planning", safetyStock: 0, targetStock: 100, bufferStatus: "Pre-Launch Zero Stock", leadTimeWeeks: 36, rmaYield: 100 },
    { name: "DGX GH200 System", phase: "Mature S&OP", safetyStock: 86, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 16, rmaYield: 85 },
    { name: "BlueField-3 DPU", phase: "Mature S&OP", safetyStock: 98, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 6, rmaYield: 97 },
    { name: "BlueField-3 SuperNIC", phase: "Mature S&OP", safetyStock: 94, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 6, rmaYield: 96 },
    { name: "ConnectX-7 Adapter", phase: "Harvesting", safetyStock: 110, targetStock: 100, bufferStatus: "Surplus Stock", leadTimeWeeks: 4, rmaYield: 99 },
    { name: "Spectrum-X100 Ethernet", phase: "Mature S&OP", safetyStock: 90, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 8, rmaYield: 98 },
    { name: "Grace CPU Superchip", phase: "Growth Ramp", safetyStock: 68, targetStock: 100, bufferStatus: "Moderate Buffer", leadTimeWeeks: 18, rmaYield: 89 },
    { name: "Jetson Orin AGX 64GB", phase: "Harvesting", safetyStock: 105, targetStock: 100, bufferStatus: "Optimal", leadTimeWeeks: 8, rmaYield: 93 },
    { name: "Drive Thor ADAS SoC", phase: "Concept / NPI Planning", safetyStock: 5, targetStock: 100, bufferStatus: "Pre-Launch Zero Stock", leadTimeWeeks: 32, rmaYield: 100 }
  ]);

  // Orchestrator Control Tower
  const [orchestratorSelectedPreset, setOrchestratorSelectedPreset] = useState(ORCHESTRATOR_PRESETS[0].id);
  const [orchKpiBreach, setOrchKpiBreach] = useState(ORCHESTRATOR_PRESETS[0].kpiBreachType);
  const [orchRegion, setOrchRegion] = useState(ORCHESTRATOR_PRESETS[0].affectedRegion);
  const [orchSku, setOrchSku] = useState(ORCHESTRATOR_PRESETS[0].impactedSku);
  const [orchestratorResult, setOrchestratorResult] = useState<OrchestratorResult | null>(null);

  // Calculate if any agent run returned simulated/fallback mode
  const isSimulationMode = 
    rmaResult?.isSimulated || 
    sensingResult?.isSimulated || 
    forecastResult?.isSimulated || 
    npiResult?.isSimulated || 
    orchestratorResult?.isSimulated;

  // Log message tracking
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[04:27:59] ORCHESTRATOR CONTROL TOWER initialized. Supply chain agents registered.",
    "[04:27:59] RMA Triage Agent online: monitoring H100, B200 physical defects and warranty telemetry.",
    "[04:27:59] Demand Sensing Agent online: listening to hyperscaler order signal anomalies.",
    "[04:27:59] Demand Forecast Agent online: loading historical multi-year S&OP planning cycle matrices.",
    "[04:27:59] Forecast Agent (NPI) online: ARIMA / XGBoost / LSTM champion-challenger harness ready."
  ]);


  // Handle preset toggles
  useEffect(() => {
    const item = DEMAND_SENSING_PRESETS.find(p => p.id === sensingSelectedPreset);
    if (item) {
      setSensingProductName(item.productName);
      setSensingHyperscaler(item.hyperscaler);
      setSensingSpikePct(item.signalSpikePct);
      setSensingVolumeUnits(item.signalVolumeUnits);
      setSensingUrgency(item.urgencyCode);
    }
  }, [sensingSelectedPreset]);

  useEffect(() => {
    const item = DEMAND_FORECAST_PRESETS.find(p => p.id === forecastSelectedPreset);
    if (item) {
      setForecastProductName(item.productName);
      setForecastSalesOverride(item.salesOverrideUnits);
      setForecastMarketingOverride(item.marketingOverrideUnits);
      setForecastHistoryYears(item.shipmentHistoryYears);
    }
  }, [forecastSelectedPreset]);

  useEffect(() => {
    const item = FORECAST_NPI_PRESETS.find(p => p.id === npiSelectedPreset);
    if (item) {
      setNpiProductName(item.productName);
      setNpiSelectedModel(item.selectedPrimaryModel);
      setNpiAdoptionRate(item.marketAdoptionRate as any);
    }
  }, [npiSelectedPreset]);



  useEffect(() => {
    const item = ORCHESTRATOR_PRESETS.find(p => p.id === orchestratorSelectedPreset);
    if (item) {
      setOrchKpiBreach(item.kpiBreachType);
      setOrchRegion(item.affectedRegion);
      setOrchSku(item.impactedSku);
    }
  }, [orchestratorSelectedPreset]);

  // Terminal autoscroll helper
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalFeed]);

  // Fetch initial products from server database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProductsList(data);
        }
      } catch (err) {
        console.error("Failed to fetch products database:", err);
      }
    };
    fetchProducts();
  }, []);

  // Trigger agents asynchronously via Express backend
  const executeAgent = async (agentId: ActiveTab | "forecast-npi", payload: any) => {
    setActiveTabStatus(prev => ({ ...prev, [agentId]: "running" }));
    setTerminalFeed([
      `[04:27:59] [System] Initializing Multi-Agent channel for: "${agentId}"...`,
      `[04:27:59] [System] Formulating prompt guidelines & embedding NVIDIA supply variables...`,
      `[04:27:59] [LLM Triage] Booting NVIDIA NIM with system instruction bounds...`
    ]);

    // Animate a high-tech terminal streaming experience while waiting for the real API call
    let timerIndex = 0;
    const terminalSimulations = [
      `[04:28:00] [Security] Appending secure header User-Agent: nvd-control`,
      `[04:28:01] [Agent Core] Querying NVIDIA product metadata cache...`,
      `[04:28:02] [Cognitive Engine] Streaming step-by-step reasoning tokens from llama-3.3-70b...`,
      `[04:28:03] [Telemetry] Aligning variables: ${JSON.stringify(payload).substring(0, 100)}...`,
      `[04:28:04] [Compiler] Parsing structured JSON output response against target schema...`
    ];

    const interval = setInterval(() => {
      if (timerIndex < terminalSimulations.length) {
        setTerminalFeed(prev => [...prev, terminalSimulations[timerIndex]]);
        timerIndex++;
      } else {
        clearInterval(interval);
      }
    }, 850);

    try {
      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, payload })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      
      clearInterval(interval); // cancel simulation, show real outputs

      // Set corresponding agent result
      if (agentId === "rma-triage") {
        setRmaResult(data);
        setRmaApprovalStatus(null);
        setRmaDocumentText(null);
        setIsEmailSending(false);
        setIsEmailSent(false);
        setRmaEscalationNotes("");
      } else if (agentId === "demand-sensing") {
        setSensingResult(data);
      } else if (agentId === "demand-forecast") {
        setForecastResult(data);
      } else if (agentId === "forecast-npi") {
        setNpiResult(data);
      } else if (agentId === "orchestrator") {
        setOrchestratorResult(data);
      }

      // Populate terminal feed with the real reasoning steps + logs from the agent
      const realLogs = data.activityLogs || [];
      const realSteps = data.reasoningSteps || [];
      
      setTerminalFeed([
        `[04:27:59] [System] Orchestration link established.`,
        `[04:27:59] [Security] Authentication success via NVIDIA API.`,
        `[04:28:00] [Agent Core] Ingesting dynamic parameters...`,
        ...realLogs.map((l: string) => `[Real-Time Log] ${l}`),
        `[04:28:01] [Explainability Layer] Parsing LLM Chain-of-thought:`,
        ...realSteps.map((s: string, idx: number) => `   Thought ${idx + 1}: ${s}`),
        `[04:28:02] [System] Triage cycle completed. Decisive JSON package compiled successfully.`
      ]);

      // Prepend to persistent log
      setSystemLogs(prev => [
        `[04:28:02] [${agentId.toUpperCase()}] Completed execution. Confidence score: ${data.confidenceScore}%`,
        ...prev
      ]);

      setActiveTabStatus(prev => ({ ...prev, [agentId]: "done" }));

    } catch (error: any) {
      clearInterval(interval);
      console.error(`Agent execution error for ${agentId}:`, error);
      setTerminalFeed(prev => [
        ...prev,
        `[04:28:04] [CRITICAL ERROR] Failed to run agent: ${error.message || error}`,
        `[04:28:04] [System] Please configure your NVIDIA_API_KEY inside your .env file or environment settings to authorize NIM requests.`
      ]);
      setActiveTabStatus(prev => ({ ...prev, [agentId]: "error" }));
    }
  };

  // Helper to simulate sending the email
  const simulateEmailDispatch = (docText: string, email: string) => {
    setIsEmailSending(true);
    setTerminalFeed(prev => [
      ...prev,
      `[Email Dispatch] Queuing official SMTP payload for: ${email}...`,
      `[Email Dispatch] Packaging encrypted PDF return attachment...`
    ]);

    setTimeout(() => {
      setIsEmailSending(false);
      setIsEmailSent(true);
      setTerminalFeed(prev => [
        ...prev,
        `[Email Dispatch] SUCCESS: RMA Directive has been successfully dispatched to ${email}!`,
        `[System] Global RMA pool updated. Regional safety buffers notified.`
      ]);
      setSystemLogs(prev => [
        `[RMA EMAIL SENT] Official RMA directive dispatched to ${email} for product ${rmaSelectedComplaint?.productName}`,
        ...prev
      ]);
    }, 1800);
  };

  // Human-in-the-Loop RMA handler
  const handleRmaAction = async (
    action: "approved" | "overridden" | "escalated",
    customDisposition?: "Self-Troubleshoot" | "Factory Refurbish" | "Direct Replacement"
  ) => {
    if (!rmaResult) return;
    
    setRmaApprovalStatus(action);
    setTerminalFeed(prev => [
      ...prev,
      `[Human-in-the-Loop] Action recorded: ${action.toUpperCase()}`,
      action === "approved" 
        ? `[Human-in-the-Loop] RMA approved. Invoking NVIDIA NIM Document compiler...`
        : action === "overridden"
        ? `[Human-in-the-Loop] RMA overridden. Changing disposition to: ${customDisposition}. Invoking NVIDIA NIM Document compiler...`
        : `[Human-in-the-Loop] RMA escalated to Tier-3 engineering queue. Notifications triggered.`
    ]);

    if (action === "escalated") {
      setRmaDocumentText(null);
      setIsEmailSent(false);
      return;
    }

    // Generate Document
    setIsGeneratingDoc(true);
    setRmaDocumentText(null);
    setIsEmailSent(false);

    const finalDisposition = action === "overridden" && customDisposition ? customDisposition : rmaResult.disposition;

    try {
      const response = await fetch("/api/agents/generate-rma-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: rmaSelectedComplaint?.productName,
          serialNumber: rmaSelectedComplaint?.serialNumber,
          defectDescription: rmaSelectedComplaint?.defectDescription,
          disposition: finalDisposition,
          warrantyStatus: rmaResult.warrantyStatus,
          warrantyDetails: rmaResult.warrantyDetails,
          confidenceScore: rmaResult.confidenceScore,
          solvabilityRecommendation: rmaResult.solvabilityRecommendation,
          approvedBy: "dhrubobworks@gmail.com",
          designatedEmail: designatedEmail
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile RMA document via API");
      }

      const data = await response.json();
      setRmaDocumentText(data.documentText);
      setTerminalFeed(prev => [
        ...prev,
        `[LLM Triage] Custom Return Authorization directive drafted successfully in compliant corporate format.`
      ]);

      // Automatically send
      simulateEmailDispatch(data.documentText, designatedEmail);

    } catch (err: any) {
      console.error("Error generating RMA document:", err);
      setTerminalFeed(prev => [
        ...prev,
        `[Error] Document compiler failed.`
      ]);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // Run default preloaded runs on initial render
  useEffect(() => {
    // Run RMA Triage initially
    if (rmaSelectedComplaint) {
      executeAgent("rma-triage", {
        productName: rmaSelectedComplaint.productName,
        serialNumber: rmaSelectedComplaint.serialNumber,
        defectDescription: rmaSelectedComplaint.defectDescription,
        purchaseDate: rmaSelectedComplaint.purchaseDate
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-nvidia-dark text-slate-100 font-sans antialiased flex flex-col selection:bg-nvidia-green selection:text-black">
      
      {/* HEADER SECTION */}
      <header className="border-b border-nvidia-border bg-nvidia-card sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {/* Legend rotated design badge */}
              <div className="w-9 h-9 bg-nvidia-green flex items-center justify-center rounded-sm shadow-[0_0_12px_rgba(118,185,0,0.2)]">
                <div className="w-4.5 h-4.5 bg-black rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-nvidia-green rotate-45" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Nvidia's AI Supply Chain Solution
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CORE LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* TABS SIDEBAR (LEFT 3 COLS on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-3 flex flex-col gap-1.5">
            <h2 className="text-[11px] font-mono tracking-widest text-nvidia-gray uppercase px-2 mb-2 font-semibold">
              Orchestration Modules
            </h2>

            {/* TAB 1: Control Tower */}
            <button
              id="tab-btn-orchestrator"
              onClick={() => setActiveTab("orchestrator")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-150 border-l-2 ${
                activeTab === "orchestrator"
                  ? "bg-nvidia-green/10 border-nvidia-green text-nvidia-green font-semibold"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-900/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Network className="h-4 w-4" />
                <span className="text-sm">Control Tower Dashboard</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-65" />
            </button>

            {/* TAB 2: RMA Triage */}
            <button
              id="tab-btn-rma"
              onClick={() => setActiveTab("rma-triage")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-150 border-l-2 ${
                activeTab === "rma-triage"
                  ? "bg-nvidia-green/10 border-nvidia-green text-nvidia-green font-semibold"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-900/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4" />
                <span className="text-sm">RMA Diagnostics & Triage</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-65" />
            </button>

            {/* TAB 2.5: NVSentinel Tracking and Monitoring */}
            <button
              id="tab-btn-nv-sentinel"
              onClick={() => setActiveTab("nv-sentinel")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-150 border-l-2 ${
                activeTab === "nv-sentinel"
                  ? "bg-nvidia-green/10 border-nvidia-green text-nvidia-green font-semibold"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-900/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-nvidia-green animate-pulse" />
                <span className="text-sm">NVSentinel Tracking & Monitoring</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-65" />
            </button>

            {/* TAB 3: Demand Sensing */}
            <button
              id="tab-btn-sensing"
              onClick={() => setActiveTab("demand-sensing")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-150 border-l-2 ${
                activeTab === "demand-sensing"
                  ? "bg-nvidia-green/10 border-nvidia-green text-nvidia-green font-semibold"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-900/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Dynamic Demand Sensing</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-65" />
            </button>

            {/* TAB 4: Demand Forecast */}
            <button
              id="tab-btn-forecast"
              onClick={() => setActiveTab("demand-forecast")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-150 border-l-2 ${
                activeTab === "demand-forecast"
                  ? "bg-nvidia-green/10 border-nvidia-green text-nvidia-green font-semibold"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-900/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Demand Forecasting & S&OP</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-65" />
            </button>

            {/* TAB 5: NPI Forecasting */}
            <button
              id="tab-btn-npi"
              onClick={() => setActiveTab("forecast-npi")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-150 border-l-2 ${
                activeTab === "forecast-npi"
                  ? "bg-nvidia-green/10 border-nvidia-green text-nvidia-green font-semibold"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-900/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5" title="Run predictive analysis for new NVIDIA hardware product introductions.">
                <Layers className="h-4 w-4" />
                <span className="text-sm">NPI Forecasting</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-65" />
            </button>

            {/* TAB 7: Agent Activity Log */}
            <button
              id="tab-btn-activity-log"
              onClick={() => setActiveTab("activity-log")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-150 border-l-2 ${
                activeTab === "activity-log"
                  ? "bg-nvidia-green/10 border-nvidia-green text-nvidia-green font-semibold"
                  : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-900/30 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4" />
                <span className="text-sm">Agent Activity Log</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-65" />
            </button>
          </div>
        </div>

        {/* ACTIVE MODULE CONTAINER (CENTER 9 COLS on desktop) */}
        <div className="lg:col-span-9 flex flex-col gap-5">
          
          <AnimatePresence mode="wait">
            {activeTab === "orchestrator" && (
              <motion.div
                key="orchestrator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* EXECUTIVE KPIS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <HoverKpiCard
                    label="Global Fill Rate"
                    value="98.4%"
                    tooltip="Measures the capability of our logistics network to fulfill incoming customer orders instantly from on-hand safety stock buffer pools without introducing backorders or shipping delays."
                    subText={
                      <div className="flex items-center gap-1 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-nvidia-green"></span>
                        <span className="text-[9px] font-mono text-nvidia-green">Target: 99.0%</span>
                      </div>
                    }
                  />
                  <HoverKpiCard
                    label="Consensus MAPE"
                    value="6.8%"
                    accentColor="text-nvidia-green"
                    tooltip="Mean Absolute Percentage Error across S&OP consensus forecasts. Reflects the percentage of prediction error deviation relative to eventual real physical shipments."
                    subText={<span className="text-[9px] font-mono text-slate-500 mt-1">Champion: LSTM</span>}
                  />
                  <HoverKpiCard
                    label="RMA Cycle TAT"
                    value="1.8 Days"
                    tooltip="Average Turnaround Time for Return Merchandise Authorization (RMA) claims processing, covering validation, diagnosis, and replacement dispatch."
                    subText={
                      <div className="flex items-center gap-1 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-nvidia-green"></span>
                        <span className="text-[9px] font-mono text-nvidia-green">SLA Target &lt; 3.0d</span>
                      </div>
                    }
                  />
                  <HoverKpiCard
                    label="Factory Board Yield"
                    value="87.4%"
                    tooltip="Percentage of fabricated boards and components passing automated physical cleanroom diagnostic tests right after assembly."
                    subText={<span className="text-[9px] font-mono text-slate-500 mt-1">Rework/Refurb Salvage</span>}
                  />
                </div>

                {/* UNIFIED MULTI-AGENT CONTROL TOWER SUITE */}
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                  <HeaderWithInfo 
                    title="RMA & Forecasts Multi-Agent Orchestration Suite"
                    subtitle="Unified control tower integrating live RMA return claim diagnostics and multi-agent demand forecasting modules."
                    tooltip="This unified module brings together live customer return status monitoring and demand forecasting nodes (S&OP, Sensing, and NPI). Click 'Run Multi-Agent AI Orchestration' to execute the AI agent and generate deep cross-functional insights."
                  />

                  {/* 1. Live RMA Status Overview */}
                  <div className="bg-[#090d16] border border-nvidia-border/60 p-4 rounded flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between border-b border-nvidia-border/40 pb-2.5">
                      <HoverFieldLabel
                        label="Live RMA Status Overview"
                        tooltip="Real-time monitor showing active customer return requests and current automated status."
                      />
                      <span className="text-[9px] font-mono text-nvidia-green uppercase bg-nvidia-green/10 border border-nvidia-green/20 px-2 py-0.5 rounded">
                        Active Monitoring
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="bg-[#0d1320] border border-nvidia-border/50 p-3 rounded flex flex-col justify-between gap-1">
                        <HoverFieldLabel
                          label="ACTIVE QUEUE ITEMS"
                          tooltip="Number of customer return tickets currently waiting for review or troubleshooting."
                        />
                        <p className="font-mono font-bold text-white text-sm mt-0.5">12 Pending Tickets</p>
                      </div>

                      <div className="bg-[#0d1320] border border-nvidia-border/50 p-3 rounded flex flex-col justify-between gap-1">
                        <HoverFieldLabel
                          label="TOP ISSUE CATEGORY"
                          tooltip="The most common hardware complaint reported by customers in recent tickets."
                        />
                        <p className="font-mono font-bold text-amber-400 text-sm mt-0.5">Power & PCIe Faults</p>
                      </div>

                      <div className="bg-[#0d1320] border border-nvidia-border/50 p-3 rounded flex flex-col justify-between gap-1">
                        <HoverFieldLabel
                          label="RESOLUTION STATUS"
                          tooltip="Current automated decision pathway assigned by the AI system to resolve active requests."
                        />
                        <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">Auto-Approved Replacements</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Forecast Agent Nodes (Node 1, Node 2, Node 3) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <button
                      onClick={() => setActiveTab("demand-forecast")}
                      className="border border-nvidia-border/80 rounded bg-[#090d16] hover:bg-nvidia-green/10 hover:border-nvidia-green p-3 transition-all flex flex-col justify-between gap-2 text-left group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono rounded font-bold">NODE 1</span>
                          <span className="text-[10px] font-mono text-emerald-400">96.2% Alignment</span>
                        </div>
                        <strong className="text-white group-hover:text-nvidia-green text-xs block">Demand Forecasting & S&OP</strong>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Consensus reviews & multi-model AI model selection across 26 weeks.</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-nvidia-green group-hover:underline pt-1 border-t border-nvidia-border/30">
                        <span>Open S&OP Module</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("demand-sensing")}
                      className="border border-nvidia-border/80 rounded bg-[#090d16] hover:bg-nvidia-green/10 hover:border-nvidia-green p-3 transition-all flex flex-col justify-between gap-2 text-left group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono rounded font-bold">NODE 2</span>
                          <span className="text-[10px] font-mono text-indigo-400">Order Signals Active</span>
                        </div>
                        <strong className="text-white group-hover:text-nvidia-green text-xs block">Dynamic Demand Sensing</strong>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Detect sudden order spikes from large enterprise customers in real-time.</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-nvidia-green group-hover:underline pt-1 border-t border-nvidia-border/30">
                        <span>Open Sensing Module</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("forecast-npi")}
                      className="border border-nvidia-border/80 rounded bg-[#090d16] hover:bg-nvidia-green/10 hover:border-nvidia-green p-3 transition-all flex flex-col justify-between gap-2 text-left group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-mono rounded font-bold">NODE 3</span>
                          <span className="text-[10px] font-mono text-orange-400">94.8% Ramp Target</span>
                        </div>
                        <strong className="text-white group-hover:text-nvidia-green text-xs block">NPI Forecasting & Launch</strong>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Predict market adoption speed and production ramp curves for new hardware.</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-nvidia-green group-hover:underline pt-1 border-t border-nvidia-border/30">
                        <span>Open NPI Module</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </button>
                  </div>

                  {/* Single Action Row to Run Orchestration and Clear Insights */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2 border-t border-nvidia-border/40">
                    <button
                      onClick={() => executeAgent("orchestrator", {})}
                      disabled={activeTabStatus.orchestrator === "running"}
                      className="flex-1 w-full bg-nvidia-green hover:bg-[#8fd100] text-black font-bold uppercase tracking-wider py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-nvidia-green/10 text-xs sm:text-sm"
                    >
                      {activeTabStatus.orchestrator === "running" ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Running Multi-Agent AI Orchestration...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-black" />
                          <span>Run Multi-Agent AI Orchestration</span>
                        </>
                      )}
                    </button>
                    {orchestratorResult && (
                      <button
                        onClick={() => setOrchestratorResult(null)}
                        className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider py-3 px-4 rounded-sm flex items-center justify-center gap-1.5 transition-all text-xs font-mono cursor-pointer hover:border-red-500/50"
                        title="Clear Orchestration Insights"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear Insights</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* IN-DEPTH DESCRIPTIVE ANALYSIS UPON EXECUTION */}
                {orchestratorResult && (
                  <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-wrap items-center justify-between border-b border-nvidia-border/60 pb-3 gap-2">
                      <div>
                        <h4 className="font-bold text-white text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-nvidia-green" />
                          <span>Multi-Agent Orchestration In-Depth Process Analysis</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Comprehensive diagnostic and demand alignment results generated by the multi-agent AI control tower.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right bg-[#090d16] border border-nvidia-border/80 px-3 py-1.5 rounded">
                          <span className="text-[10px] font-mono text-slate-400 block">AI CONFIDENCE SCORE</span>
                          <div className="text-base font-bold text-nvidia-green font-mono">{orchestratorResult.confidenceScore}% Validated</div>
                        </div>
                        <button
                          onClick={() => setOrchestratorResult(null)}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono rounded flex items-center gap-1.5 cursor-pointer transition-all hover:border-red-500/50"
                          title="Clear all insights for RMA and Forecast Orchestration"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Clear Insights</span>
                        </button>
                      </div>
                    </div>

                    {/* Executive Summary Strategy */}
                    <div className="bg-[#090d16] border border-nvidia-border/80 p-4 rounded flex flex-col gap-3">
                      <HeaderWithInfo 
                        title="Unified Mitigation Strategy"
                        subtitle="Actionable recommendation synthesized across RMA and forecasting agents."
                        tooltip="This is the overarching solution plan created by combining return claims data, factory spare parts availability, and updated demand forecasts."
                      />
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {orchestratorResult.mitigationPlanSummary}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="bg-[#0d1320] border border-nvidia-border/60 p-3 rounded">
                          <span className="text-slate-400 font-mono text-[10px] block uppercase">Current System Status</span>
                          <strong className="text-amber-400 font-semibold text-xs mt-0.5 block">{orchestratorResult.currentKpiValue}</strong>
                        </div>
                        <div className="bg-[#0d1320] border border-nvidia-border/60 p-3 rounded">
                          <span className="text-slate-400 font-mono text-[10px] block uppercase">Target Recovery Status</span>
                          <strong className="text-nvidia-green font-semibold text-xs mt-0.5 block">{orchestratorResult.targetKpiValue}</strong>
                        </div>
                      </div>
                    </div>

                    {/* IN-DEPTH DESCRIPTIVE ANALYSIS: RMA AGENT */}
                    <div className="bg-[#090d16] border border-nvidia-border/80 p-4 rounded flex flex-col gap-3">
                      <div className="flex items-center gap-2 border-b border-nvidia-border/40 pb-2">
                        <Wrench className="h-4 w-4 text-amber-400" />
                        <h5 className="font-bold text-white text-sm">RMA Agent: In-Depth Return Claims Analysis</h5>
                      </div>
                      
                      <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                        <p>
                          <strong className="text-white">Customer Issue Intake & Diagnosis: </strong>
                          The RMA Agent processed all active hardware return claims submitted to the system. It analyzed user symptom descriptions (such as thermal throttling, power supply instability, PCIe lane negotiation failures, and display driver crashes) against official hardware diagnostic knowledge.
                        </p>
                        <p>
                          <strong className="text-white">Triage & Resolution Path: </strong>
                          The AI verified that <strong className="text-emerald-400">89.4%</strong> of non-fatal firmware or configuration issues can be resolved remotely via guided troubleshooting steps, avoiding unnecessary physical shipping. For physical defects, the agent automatically determined whether units require direct stock replacement or can be routed to regional factory refurbishing centers (<strong className="text-amber-400">92.1% repair yield</strong>).
                        </p>
                      </div>

                      <div className="bg-[#0d1320] border border-nvidia-border/60 p-3 rounded text-xs space-y-1">
                        <span className="font-semibold text-nvidia-green font-mono text-[11px] block">RMA AGENT ACTION ITEM:</span>
                        <p className="text-slate-300 text-[11px]">
                          Automated approval dispatched for eligible return tickets. Replenishment stock allocations generated for regional service centers to maintain turnaround time under 2 days.
                        </p>
                      </div>
                    </div>

                    {/* IN-DEPTH DESCRIPTIVE ANALYSIS: FORECASTS AGENTS */}
                    <div className="bg-[#090d16] border border-nvidia-border/80 p-4 rounded flex flex-col gap-3">
                      <div className="flex items-center gap-2 border-b border-nvidia-border/40 pb-2">
                        <TrendingUp className="h-4 w-4 text-nvidia-green" />
                        <h5 className="font-bold text-white text-sm">Forecasts Agent: In-Depth Demand & Supply Alignment Analysis</h5>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                        <p>
                          <strong className="text-white">S&OP Long-Term Alignment: </strong>
                          The Demand Forecasting Agent reviewed the 26-week sales consensus plan. By comparing past shipment histories with sales team input, it achieved a high forecast alignment of <strong className="text-emerald-400">96.2%</strong> using the Temporal Fusion Transformer AI champion model.
                        </p>
                        <p>
                          <strong className="text-white">Real-Time Order Sensing: </strong>
                          Dynamic Demand Sensing ingested recent order telemetry from enterprise cloud customers. It identified a localized demand surge of <strong className="text-indigo-400">+28.4%</strong> in Weeks 2 to 5, distinguishing genuine long-term demand growth from temporary order noise.
                        </p>
                        <p>
                          <strong className="text-white">New Product Launch (NPI) Ramp: </strong>
                          For newly launched hardware architectures, the NPI Agent modeled adoption curves without needing past sales history, establishing a peak target velocity of <strong className="text-orange-400">125,000 units by Week 12</strong>.
                        </p>
                      </div>

                      <div className="bg-[#0d1320] border border-nvidia-border/60 p-3 rounded text-xs space-y-1">
                        <span className="font-semibold text-nvidia-green font-mono text-[11px] block">FORECAST AGENT ACTION ITEM:</span>
                        <p className="text-slate-300 text-[11px]">
                          Fast-track PCB board assembly starts and reallocate APAC component safety stock to cover the sensed demand surge without causing shortages in other regions.
                        </p>
                      </div>
                    </div>

                    {/* GRAPHICAL CHARTS VISUALS IN INSIGHTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Chart 1: RMA Defect Triage Breakdown */}
                      <div className="bg-[#090d16] border border-nvidia-border/80 p-4 rounded flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-nvidia-border/40 pb-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-amber-400" />
                            <h5 className="font-bold text-white text-xs font-mono uppercase">RMA Claims Triage Distribution</h5>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">By Issue Category</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Breakdown of active return tickets by hardware complaint category and AI disposition.</p>
                        <div className="h-52 w-full pt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { category: "Power/PCIe", troubleshot: 4, refurbished: 6, replaced: 2 },
                                { category: "Thermal", troubleshot: 8, refurbished: 2, replaced: 0 },
                                { category: "Firmware", troubleshot: 12, refurbished: 1, replaced: 0 },
                                { category: "Display/VRAM", troubleshot: 2, refurbished: 5, replaced: 3 }
                              ]}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                              <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: "#090d16", borderColor: "#1f293d", borderRadius: "6px", fontSize: "11px" }}
                                itemStyle={{ color: "#e2e8f0" }}
                              />
                              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }} />
                              <Bar dataKey="troubleshot" name="Troubleshot (89.4%)" fill="#10b981" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="refurbished" name="Refurbished (92.1%)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="replaced" name="Direct Replaced" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Chart 2: Demand Sensing vs Supply Recovery Projection */}
                      <div className="bg-[#090d16] border border-nvidia-border/80 p-4 rounded flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-nvidia-border/40 pb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-nvidia-green" />
                            <h5 className="font-bold text-white text-xs font-mono uppercase">Demand Sensing vs Supply Recovery</h5>
                          </div>
                          <span className="text-[9px] font-mono text-nvidia-green">8-Week Forecast</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Comparison of detected demand surge against reallocated supply buffer and baseline planning.</p>
                        <div className="h-52 w-full pt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={[
                                { week: "Wk 1", baseline: 100, sensedDemand: 128, supplyBuffer: 110 },
                                { week: "Wk 2", baseline: 105, sensedDemand: 132, supplyBuffer: 118 },
                                { week: "Wk 3", baseline: 110, sensedDemand: 135, supplyBuffer: 128 },
                                { week: "Wk 4", baseline: 115, sensedDemand: 138, supplyBuffer: 136 },
                                { week: "Wk 5", baseline: 120, sensedDemand: 135, supplyBuffer: 140 },
                                { week: "Wk 6", baseline: 122, sensedDemand: 130, supplyBuffer: 142 },
                                { week: "Wk 7", baseline: 125, sensedDemand: 128, supplyBuffer: 145 },
                                { week: "Wk 8", baseline: 128, sensedDemand: 128, supplyBuffer: 148 }
                              ]}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="sensedColor" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="supplyColor" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#76b900" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#76b900" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                              <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: "#090d16", borderColor: "#1f293d", borderRadius: "6px", fontSize: "11px" }}
                                itemStyle={{ color: "#e2e8f0" }}
                              />
                              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }} />
                              <Area type="monotone" dataKey="sensedDemand" name="Sensed Order Spike (+28.4%)" stroke="#818cf8" fillOpacity={1} fill="url(#sensedColor)" />
                              <Area type="monotone" dataKey="supplyBuffer" name="Supply Capacity Buffer" stroke="#76b900" fillOpacity={1} fill="url(#supplyColor)" />
                              <Line type="monotone" dataKey="baseline" name="Baseline S&OP Target" stroke="#38bdf8" strokeDasharray="3 3" dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "rma-triage" && (
              <motion.div
                key="rma-triage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* RMA INPUTS */}
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                  <HeaderWithInfo 
                    title="RMA Diagnostics & Triage"
                    subtitle="Select an incoming consumer return ticket appended to the queue to trigger automated AI diagnostics via NVIDIA's API."
                    tooltip="This module automatically analyzes incoming hardware return claims. AI evaluates customer defect descriptions against technical diagnostic knowledge to determine if the issue can be fixed with step-by-step troubleshooting, factory refurbishing, or direct replacement."
                  />

                  {/* Complaint Selector */}
                  <div className="flex flex-col gap-2">
                    {CUSTOMER_COMPLAINTS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setRmaSelectedComplaint(c)}
                        className={`text-xs text-left p-3 rounded border transition-all ${
                          rmaSelectedComplaint?.id === c.id
                            ? "bg-nvidia-green/10 border-nvidia-green text-white"
                            : "bg-[#090d16] border-nvidia-border text-slate-400 hover:bg-slate-800/20"
                        }`}
                      >
                        <strong className="block text-sm">{c.label}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">SN: {c.serialNumber}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (rmaSelectedComplaint) {
                        executeAgent("rma-triage", { 
                          productName: rmaSelectedComplaint.productName, 
                          serialNumber: rmaSelectedComplaint.serialNumber, 
                          defectDescription: rmaSelectedComplaint.defectDescription, 
                          purchaseDate: rmaSelectedComplaint.purchaseDate 
                        });
                      }
                    }}
                    disabled={!rmaSelectedComplaint || activeTabStatus["rma-triage"] === "running"}
                    className="w-full bg-nvidia-green hover:bg-[#8fd100] text-black font-bold uppercase tracking-wider py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {activeTabStatus["rma-triage"] === "running" ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Evaluating Return Variables...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-black" />
                        <span>Start RMA Diagnostic Process</span>
                      </>
                    )}
                  </button>
                </div>

                {/* RMA TRIAGE GRAPHIC OUTPUT */}
                {rmaResult && (
                  <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-nvidia-border/60 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-nvidia-green uppercase tracking-wider">Troubleshooting Suitability Analysis</span>
                        <h4 className="font-bold text-white text-base">Triage Recommendation Details</h4>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <button
                          onClick={() => setRmaResult(null)}
                          className="text-[10px] text-nvidia-gray hover:text-white flex items-center gap-1 transition-colors mb-1"
                        >
                          Clear
                        </button>
                        <span className="text-[10px] font-mono text-nvidia-gray">DISPOSITION</span>
                        <span className={`block font-bold text-xs px-2.5 py-1 rounded mt-1 ${
                          rmaResult.disposition === "Self-Troubleshoot" 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                            : rmaResult.disposition === "Factory Refurbish" 
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" 
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}>
                          {rmaResult.disposition}
                        </span>
                      </div>
                    </div>

                    {/* EXPLAINABILITY SUB-GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-[#090d16] p-3 rounded border border-nvidia-border/50 text-xs">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">Inputs Ingested</span>
                        <p className="text-white mt-1 leading-normal font-mono text-[11px] truncate">
                          {rmaSelectedComplaint?.productName} (S/N: {rmaSelectedComplaint?.serialNumber})
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">Confidence Rating</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-bold text-nvidia-green text-[13px]">{rmaResult.confidenceScore}%</span>
                          <span className="text-[10px] text-slate-400 font-mono">LLM Validated</span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step troubleshooting guidelines */}
                    <div className="bg-[#090d16] border border-nvidia-border p-3 rounded flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-nvidia-green" />
                        <h5 className="text-xs font-mono text-nvidia-green uppercase tracking-wide font-bold">Recommended Resolution</h5>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                        {rmaResult.solvabilityRecommendation}
                      </p>
                    </div>

                    {/* Warranty check stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#0d1320] border border-nvidia-border/60 p-2.5 rounded">
                        <span className="text-slate-400 font-mono block uppercase text-[9px]">Warranty Evaluation</span>
                        <strong className={`font-semibold text-xs ${rmaResult.warrantyStatus === "Active" ? "text-emerald-400" : "text-rose-400"}`}>
                          {rmaResult.warrantyStatus}
                        </strong>
                      </div>
                      <div className="bg-[#0d1320] border border-nvidia-border/60 p-2.5 rounded">
                        <span className="text-slate-400 font-mono block uppercase text-[9px]">SLA Coverage Details</span>
                        <strong className="text-slate-200 font-semibold text-xs">{rmaResult.warrantyDetails}</strong>
                      </div>
                    </div>

                    {/* ADVANCED FAILURE RATE & REPAIR RATE ANALYTICS PANEL */}
                    <div className="bg-[#090d16] border border-nvidia-border/80 rounded-lg p-4 flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b border-nvidia-border/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4.5 w-4.5 text-nvidia-green" />
                          <h5 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                            RMA Failure Rate & Repair Rate Analysis Hub
                          </h5>
                        </div>
                        <span className="text-[10px] font-mono text-nvidia-green bg-nvidia-green/10 border border-nvidia-green/20 px-2.5 py-0.5 rounded font-semibold">
                          FIELD TELEMETRY & REPAIR METRICS
                        </span>
                      </div>

                      {/* SECTION 1: FAILURE RATE ANALYSIS */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <h6 className="text-xs font-mono font-bold text-slate-200 uppercase">
                              1. Failure Rate Analysis & Telemetry Trends
                            </h6>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">
                            Trend: <span className="text-nvidia-green font-semibold">{rmaResult.failureRepairAnalysis?.failureRateTrend ?? "-0.8% YoY drop following SBIOS v95.02 release"}</span>
                          </span>
                        </div>

                        {/* FAILURE KPIS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="bg-[#05080e] border border-nvidia-border/50 p-2.5 rounded flex flex-col">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Annual Failure Rate (AFR)</span>
                            <strong className="text-amber-400 font-bold text-base mt-0.5">
                              {rmaResult.failureRepairAnalysis?.failureRateAfrPct ?? (rmaResult.disposition === "Self-Troubleshoot" ? 1.8 : 4.6)}%
                            </strong>
                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">NVIDIA Spec Limit: &lt; 2.5%</span>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/50 p-2.5 rounded flex flex-col">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Mean Time Between Failures</span>
                            <strong className="text-white font-bold text-base mt-0.5">
                              {(rmaResult.failureRepairAnalysis?.mtbfHours ?? (rmaResult.disposition === "Self-Troubleshoot" ? 28500 : 12400)).toLocaleString()} hrs
                            </strong>
                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">Industry Target: &gt; 20,000 hrs</span>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/50 p-2.5 rounded flex flex-col">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">First Time Fix Rate</span>
                            <strong className="text-emerald-400 font-bold text-base mt-0.5">
                              {rmaResult.failureRepairAnalysis?.firstTimeFixRatePct ?? 91.8}%
                            </strong>
                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">No Repeat Return Rate</span>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/50 p-2.5 rounded flex flex-col">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Field Defect Concentration</span>
                            <strong className="text-sky-400 font-bold text-base mt-0.5">
                              Top 2 Causes = 64.5%
                            </strong>
                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">Targeted Mitigation Focus</span>
                          </div>
                        </div>

                        {/* ROOT CAUSES & RECOMMENDATIONS TABLE */}
                        <div className="bg-[#05080e] border border-nvidia-border/60 rounded p-3 flex flex-col gap-2.5 mt-1">
                          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                            Identified Root Failure Causes & Recommended Action Playbooks:
                          </span>

                          <div className="flex flex-col gap-2">
                            {(rmaResult.failureRepairAnalysis?.topFailureCauses || [
                              {
                                cause: "Power Phase Controller & MOSFET Voltage Ripple Spike",
                                percentage: 38.4,
                                severity: "High" as const,
                                impactDescription: "Induces random PCIe bus reset dropping GPU instance from NVLink fabric during heavy matrix multiplication.",
                                recommendation: "Flash SBIOS power management patch v95.02.3E and re-seat 12V-2x6 power harness with latch confirmation."
                              },
                              {
                                cause: "HBM3 Memory Substrate Micro-Solder Degradation",
                                percentage: 26.1,
                                severity: "High" as const,
                                impactDescription: "Causes uncorrectable ECC memory error spikes during 70B parameter model gradient accumulation.",
                                recommendation: "Perform cleanroom BGA reflow at factory repair depot; apply underfill elastomer reinforcement."
                              },
                              {
                                cause: "Cold Plate Micro-Channel Fluid Blockage / Thermal Throttling",
                                percentage: 21.5,
                                severity: "Medium" as const,
                                impactDescription: "Junction temperature spikes to 92°C causing clock throttling from 1.8GHz down to 1.1GHz.",
                                recommendation: "Flush liquid cooling loop at 0.6 BAR differential pressure; inspect host cold plate quick-disconnect fittings."
                              },
                              {
                                cause: "PCIe Gen5 Signal Retimer Firmware Desynchronization",
                                percentage: 14.0,
                                severity: "Low" as const,
                                impactDescription: "Intermittent link downgrades from PCIe Gen5 x16 to Gen4 x8 under multi-host topologies.",
                                recommendation: "Execute host UEFI update with Re-Size BAR enabled and update retimer EEPROM to v2.14."
                              }
                            ]).map((item, idx) => (
                              <div key={idx} className="bg-[#090d16] border border-nvidia-border/50 p-2.5 rounded flex flex-col gap-1.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                      item.severity === "High"
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        : item.severity === "Medium"
                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                        : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                    }`}>
                                      {item.severity} Severity
                                    </span>
                                    <strong className="text-xs text-white font-semibold">{item.cause}</strong>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-slate-400">{item.percentage}% of Returns</span>
                                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-300 font-sans leading-tight">
                                  <strong className="text-slate-400 font-mono text-[10px]">Impact:</strong> {item.impactDescription}
                                </p>

                                <div className="bg-nvidia-green/5 border border-nvidia-green/20 p-2 rounded flex items-start gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-nvidia-green shrink-0 mt-0.5" />
                                  <p className="text-[11px] text-nvidia-green font-mono leading-tight">
                                    <strong>Recommendation:</strong> {item.recommendation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: REPAIR RATE ANALYSIS */}
                      <div className="flex flex-col gap-3 border-t border-nvidia-border/40 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-nvidia-green" />
                            <h6 className="text-xs font-mono font-bold text-slate-200 uppercase">
                              2. Repair Rate Analysis & Component Refurbish Yield
                            </h6>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            ${(rmaResult.failureRepairAnalysis?.salvageSavingsUsd ?? 24200).toLocaleString()} Recovered / RMA Batch
                          </span>
                        </div>

                        {/* REPAIR KPIS */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div className="bg-[#05080e] border border-nvidia-border/50 p-2.5 rounded flex flex-col">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Overall Repairability Yield</span>
                            <strong className="text-nvidia-green font-bold text-base mt-0.5">
                              {rmaResult.failureRepairAnalysis?.repairabilityRatePct ?? 94.2}%
                            </strong>
                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">Avoids Hardware Scrap Write-off</span>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/50 p-2.5 rounded flex flex-col">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Average Repair Turnaround (TAT)</span>
                            <strong className="text-sky-400 font-bold text-base mt-0.5">
                              {rmaResult.failureRepairAnalysis?.avgRepairTatDays ?? 0.5} Days
                            </strong>
                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">vs 18 Days Full Component Replacement</span>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/50 p-2.5 rounded flex flex-col">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Factory Refurbishment Cost</span>
                            <strong className="text-emerald-400 font-bold text-base mt-0.5">
                              12% of Replacement Cost
                            </strong>
                            <span className="text-[8px] text-slate-500 font-mono mt-0.5">88% Financial Savings</span>
                          </div>
                        </div>

                        {/* COMPONENT REPAIR YIELD BREAKDOWN */}
                        <div className="bg-[#05080e] border border-nvidia-border/60 rounded p-3 flex flex-col gap-2.5">
                          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                            Component Repairability Yields & Repair Procedures:
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {(rmaResult.failureRepairAnalysis?.repairYieldByComponent || [
                              {
                                component: "SXM5 / OAM Baseboard Power Rails",
                                repairYieldPct: 96.5,
                                avgTatHours: 12,
                                recommendation: "In-field component swap of surface-mount capacitors and power stages."
                              },
                              {
                                component: "HBM3 Memory Substrate Stack",
                                repairYieldPct: 84.2,
                                avgTatHours: 36,
                                recommendation: "Laser BGA reballing at automated cleanroom refurbishment station."
                              },
                              {
                                component: "NVLink Switch Interconnect ASIC",
                                repairYieldPct: 88.0,
                                avgTatHours: 24,
                                recommendation: "Automated optical inspection and substrate pad cleaning."
                              }
                            ]).map((comp, idx) => (
                              <div key={idx} className="bg-[#090d16] border border-nvidia-border/50 p-2.5 rounded flex flex-col justify-between gap-1.5">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <strong className="text-xs text-white font-semibold truncate">{comp.component}</strong>
                                    <span className="text-[10px] font-mono font-bold text-nvidia-green">{comp.repairYieldPct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                                    <div className="bg-nvidia-green h-full rounded-full" style={{ width: `${comp.repairYieldPct}%` }}></div>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-mono block">TAT: {comp.avgTatHours} hours</span>
                                </div>
                                <p className="text-[10px] text-slate-300 font-sans border-t border-nvidia-border/30 pt-1.5">
                                  {comp.recommendation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: IMPACT ON CURRENT RMA COMPONENT */}
                      <div className="bg-nvidia-green/5 border border-nvidia-green/30 p-3 rounded flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-nvidia-green" />
                          <span className="text-[11px] font-mono font-bold text-nvidia-green uppercase">
                            Impact on Current Incoming RMA Component (S/N: {rmaSelectedComplaint?.serialNumber ?? "SN-NVD-H100-983712"})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                          {rmaResult.failureRepairAnalysis?.rmaProcessImpactSummary ?? 
                            `Current component (${rmaSelectedComplaint?.productName}) enters the RMA queue with a historical failure rate of 1.8%. Routing this unit via ${rmaResult.disposition} leverages NVIDIA's 94.2% component repairability yield, eliminating unnecessary replacement lead times and returning the unit to operational health in under 0.5 days.`}
                        </p>
                      </div>
                    </div>

                    {/* HUMAN IN THE LOOP ACTIONS AND ESCALATIONS */}
                    <div className="border-t border-nvidia-border/50 pt-4 mt-2 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-nvidia-green/10 text-nvidia-green border border-nvidia-green/20">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Human-in-the-Loop Triage Decision Board</h4>
                          <p className="text-[10px] text-slate-400">Review, modify, or escalate the AI recommendation and dispatch standard return documents.</p>
                        </div>
                      </div>

                      {/* Designated Person Email Block */}
                      <div className="bg-[#090d16] border border-nvidia-border/40 p-3 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <HoverFieldLabel 
                            label="Designated Recipient Responsible" 
                            tooltip="Recipient responsible for processing hardware logistics and service orders." 
                          />
                        </div>
                        <div className="flex items-center gap-1.5 w-full md:w-auto">
                          <Mail className="h-3.5 w-3.5 text-nvidia-green" />
                          <input
                            type="email"
                            value={designatedEmail}
                            onChange={(e) => setDesignatedEmail(e.target.value)}
                            placeholder="rma-operator@nvidia.com"
                            className="bg-[#05080e] border border-nvidia-border/80 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-nvidia-green focus:outline-none min-w-[200px]"
                          />
                        </div>
                      </div>

                      {/* Decisive Actions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* APPROVE BUTTON */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Option A: Standard Flow</span>
                          <button
                            onClick={() => handleRmaAction("approved")}
                            disabled={isGeneratingDoc || activeTabStatus["rma-triage"] === "running"}
                            className={`w-full py-2 px-3 text-xs rounded font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              rmaApprovalStatus === "approved"
                                ? "bg-emerald-500 text-black border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve & Write Doc</span>
                          </button>
                        </div>

                        {/* OVERRIDE BUTTON + SELECTION */}
                        <div className="flex flex-col gap-1.5 bg-slate-900/40 border border-nvidia-border/40 p-2 rounded">
                          <HoverFieldLabel 
                            label="Option B: Manual Correction" 
                            tooltip="Select an alternative disposition for this hardware return." 
                          />
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={rmaOverrideDisposition}
                              onChange={(e) => setRmaOverrideDisposition(e.target.value as any)}
                              className="bg-[#05080e] border border-nvidia-border/60 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                            >
                              <option value="Self-Troubleshoot">Self-Troubleshoot</option>
                              <option value="Factory Refurbish">Factory Refurbish</option>
                              <option value="Direct Replacement">Direct Replacement</option>
                            </select>
                            <button
                              onClick={() => handleRmaAction("overridden", rmaOverrideDisposition)}
                              disabled={isGeneratingDoc || activeTabStatus["rma-triage"] === "running"}
                              className={`w-full py-1.5 px-2 text-[10px] rounded font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                rmaApprovalStatus === "overridden"
                                  ? "bg-nvidia-green text-black border border-nvidia-green"
                                  : "bg-nvidia-green/10 hover:bg-nvidia-green/20 text-nvidia-green border border-nvidia-green/30"
                              }`}
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Override Disposition</span>
                            </button>
                          </div>
                        </div>

                        {/* ESCALATE BUTTON */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Option C: Engineering Review</span>
                          <button
                            onClick={() => handleRmaAction("escalated")}
                            disabled={isGeneratingDoc || activeTabStatus["rma-triage"] === "running"}
                            className={`w-full py-2 px-3 text-xs rounded font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              rmaApprovalStatus === "escalated"
                                ? "bg-amber-500 text-black border border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Escalate to Tier-3 QA</span>
                          </button>
                        </div>
                      </div>

                      {/* ESCALATION VIEW NOTES */}
                      {rmaApprovalStatus === "escalated" && (
                        <div className="bg-amber-500/5 border border-amber-500/30 p-3 rounded flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <strong className="text-xs text-amber-400">Escalated to High-Tier QA Team</strong>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-normal">
                            This return is flagged for immediate manual inspection at the NVIDIA primary cluster lab. Pre-emptive alerts have been dispatched to Tier-3 technicians.
                          </p>
                          <div className="flex flex-col gap-1.5 mt-1">
                            <HoverFieldLabel 
                              label="Additional Engineering Notes" 
                              tooltip="Add specific technical observations for the engineering review." 
                            />
                            <textarea
                              rows={2}
                              value={rmaEscalationNotes}
                              onChange={(e) => setRmaEscalationNotes(e.target.value)}
                              placeholder="e.g., suspect high-density packaging micro-cracks under silicon substrate..."
                              className="bg-[#05080e] border border-nvidia-border/80 rounded px-2.5 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none font-mono resize-none"
                            />
                            <button
                              onClick={() => {
                                setTerminalFeed(prev => [
                                  ...prev,
                                  `[Escalation Queue] Registered custom manual review notes: "${rmaEscalationNotes}"`
                                ]);
                                setSystemLogs(prev => [
                                  `[RMA ESCALATED] Tech Notes added for S/N ${rmaSelectedComplaint?.serialNumber}: "${rmaEscalationNotes}"`,
                                  ...prev
                                ]);
                              }}
                              className="self-end bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer"
                            >
                              Log Technical Notes
                            </button>
                          </div>
                        </div>
                      )}

                      {/* LLM GENERATING DOCUMENT SPINNER */}
                      {isGeneratingDoc && (
                        <div className="bg-[#090d16] border border-nvidia-border/40 p-6 rounded flex flex-col items-center justify-center gap-3">
                          <RefreshCw className="h-6 w-6 text-nvidia-green animate-spin" />
                          <div className="text-center">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">NVIDIA NIM Drafting Return Authorization Directive...</h5>
                            <p className="text-[10px] text-slate-400">Formulating exhaustive RMA technical documentation & routing logistics...</p>
                          </div>
                        </div>
                      )}

                      {/* DOCUMENT & DISPATCH SIMULATION RENDER */}
                      {rmaDocumentText && (
                        <div className="flex flex-col gap-3">
                          
                          {/* Live Dispatch Notification Card */}
                          <div className={`p-3 rounded border flex items-center justify-between text-xs transition-all ${
                            isEmailSending
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-300 animate-pulse"
                              : isEmailSent
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                              : "bg-[#090d16] border-nvidia-border"
                          }`}>
                            <div className="flex items-center gap-2.5">
                              {isEmailSending ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                              ) : isEmailSent ? (
                                <CheckCircle2 className="h-4.5 w-4.5 text-nvidia-green" />
                              ) : (
                                <Mail className="h-4 w-4 text-slate-400" />
                              )}
                              <div>
                                <strong className="block text-[11px] uppercase font-mono">
                                  {isEmailSending 
                                    ? "Dispatched Document SMTP Routing..." 
                                    : isEmailSent 
                                    ? "SIMULATED EMAIL DISPATCH SUCCESSFUL" 
                                    : "RMA Document Written Successfully"}
                                </strong>
                                <span className="text-[10px] text-slate-400">
                                  {isEmailSending 
                                    ? `Transmitting secure electronic file with active attachment...` 
                                    : isEmailSent 
                                    ? `Official technical directives sent successfully to ${designatedEmail}!` 
                                    : `RMA directive is finalized and ready to dispatch to ${designatedEmail}`}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => simulateEmailDispatch(rmaDocumentText, designatedEmail)}
                              disabled={isEmailSending}
                              className="text-[10px] font-bold bg-[#090d16] border border-nvidia-border hover:border-nvidia-green text-slate-300 px-3 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="h-3 w-3" />
                              <span>{isEmailSent ? "Re-send Email" : "Trigger Send"}</span>
                            </button>
                          </div>

                          {/* Beautiful Corporate Document Board */}
                          <div className="bg-[#090d16] border border-nvidia-border rounded p-4 relative overflow-hidden select-text">
                            {/* Watermark/Header Badge */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-50 select-none">
                              <span className="h-1.5 w-1.5 rounded-full bg-nvidia-green animate-pulse"></span>
                              <span className="text-[8px] font-mono text-nvidia-green uppercase tracking-widest">NVIDIA Official Triage</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 border-b border-nvidia-border/50 pb-2 mb-3">
                              <FileText className="h-4 w-4 text-nvidia-green" />
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Return Document Output (LLM Authored)</span>
                            </div>

                            <MarkdownRenderer text={rmaDocumentText} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: NVSentinel Tracking and Monitoring View */}
            {activeTab === "nv-sentinel" && (
              <motion.div
                key="nv-sentinel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* HEADER & OVERVIEW */}
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                  <HeaderWithInfo
                    title="NVSentinel Tracking & Telemetry Monitoring"
                    subtitle="Active telemetry ingestion monitoring hardware health across enterprise data centers. Detects imminent point-of-failure signals and automatically dispatches proactive replacements or repair requests before downtime occurs."
                    tooltip="NVIDIA NVSentinel continuously listens to voltage ripple, junction temperature spikes, PCIe error counters, and liquid cooling differential pressure across global data center deployments."
                  />

                  {/* EXECUTIVE TELEMETRY KPIS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <HoverKpiCard
                      label="Monitored Data Center Nodes"
                      value="1,420 Racks"
                      tooltip="Total active enterprise server racks connected to NVSentinel telemetry stream across CoreWeave, Azure, AWS, Meta, and Equinix hubs."
                      subText={
                        <div className="flex items-center gap-1 mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-nvidia-green animate-pulse"></span>
                          <span className="text-[9px] font-mono text-nvidia-green">100% Telemetry Online</span>
                        </div>
                      }
                    />

                    <HoverKpiCard
                      label="Active Enterprise GPUs"
                      value="184,500 Units"
                      tooltip="H100, H200, B200, and GH200 hardware units being monitored for real-time thermal, voltage, and signal integrity anomalies."
                      subText={
                        <span className="text-[9px] font-mono text-slate-400">99.4% Operational Health</span>
                      }
                    />

                    <HoverKpiCard
                      label="Proactive Faults Prevented"
                      value="142 Instances"
                      tooltip="Number of hardware failures prevented by pre-emptively dispatching replacement boards before data center job crashes occurred."
                      accentColor="text-emerald-400"
                      subText={
                        <span className="text-[9px] font-mono text-emerald-400">$3.8M SLA Downtime Saved</span>
                      }
                    />

                    <HoverKpiCard
                      label="Active Predictive Warnings"
                      value="3 Alerts"
                      tooltip="Data center nodes currently showing voltage or thermal signatures indicating an imminent point of failure."
                      accentColor="text-amber-400"
                      subText={
                        <span className="text-[9px] font-mono text-amber-400">Action Required</span>
                      }
                    />
                  </div>
                </div>

                {/* FLEET SELECTOR & LIVE NODE DETAIL */}
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nvidia-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-nvidia-green animate-pulse" />
                        <h3 className="font-bold text-white text-sm">Active Data Center Equipment Fleet</h3>
                      </div>
                      <p className="text-[11px] text-slate-400">Select a monitored equipment rack to inspect live sensor metrics and trigger proactive dispatches.</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-[#090d16] px-2.5 py-1 rounded border border-nvidia-border/60">
                      TELEMETRY STREAM: LIVE 100ms SAMPLING
                    </span>
                  </div>

                  {/* NODE SELECTION CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {NV_SENTINEL_NODES.map((node) => {
                      const isSelected = sentinelSelectedNodeId === node.id;
                      const status = sentinelProactiveActionStatus[node.id] || "idle";
                      return (
                        <button
                          key={node.id}
                          onClick={() => setSentinelSelectedNodeId(node.id)}
                          className={`text-left p-3 rounded border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-nvidia-green/10 border-nvidia-green shadow-[0_0_12px_rgba(118,185,0,0.15)] text-white"
                              : "bg-[#090d16] border-nvidia-border text-slate-400 hover:border-nvidia-green/40 hover:text-slate-200"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[9px] font-mono uppercase text-slate-400">{node.dataCenterLocation}</span>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                node.healthScore < 70
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : node.healthScore < 80
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                {node.healthScore}% HEALTH
                              </span>
                            </div>
                            <strong className="block text-xs text-white font-semibold truncate">{node.clusterName}</strong>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{node.nodeType}</span>
                          </div>

                          <div className="border-t border-nvidia-border/40 pt-2 mt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 font-mono">Predicted Fault:</span>
                            <span className="text-amber-400 font-mono font-bold">in {node.predictedFailureTimeHours} hrs</span>
                          </div>

                          {status !== "idle" && (
                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-nvidia-green/20 text-nvidia-green border border-nvidia-green/30 text-center mt-1">
                              {status === "dispatched" && "REPLACEMENT DISPATCHED"}
                              {status === "scheduled" && "REPAIR SCHEDULED"}
                              {status === "alerted" && "OPS LEAD NOTIFIED"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* SELECTED NODE TELEMETRY DEEP DIVE */}
                  {(() => {
                    const node = NV_SENTINEL_NODES.find(n => n.id === sentinelSelectedNodeId) || NV_SENTINEL_NODES[0];
                    const currentStatus = sentinelProactiveActionStatus[node.id] || "idle";

                    return (
                      <div className="bg-[#090d16] border border-nvidia-border/80 rounded-lg p-4 flex flex-col gap-4 mt-2">
                        {/* DEEP DIVE HEADER */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nvidia-border/50 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Cpu className="h-4 w-4 text-nvidia-green" />
                              <h4 className="font-bold text-white text-base">{node.clusterName}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Hardware: {node.nodeType} | Serial Number: <code className="text-nvidia-green">{node.serialNumber}</code>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">Coverage:</span>
                            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">
                              {node.warrantyStatus}
                            </span>
                          </div>
                        </div>

                        {/* LIVE METRICS GAUGE GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                          <div className="bg-[#05080e] border border-nvidia-border/60 p-2.5 rounded flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Junction Temp (°C)</span>
                            <div className="flex items-baseline justify-between mt-1">
                              <strong className={`text-base font-bold ${node.telemetryMetrics.junctionTempC > 85 ? "text-rose-400" : "text-amber-400"}`}>
                                {node.telemetryMetrics.junctionTempC}°C
                              </strong>
                              <span className="text-[9px] text-slate-500 font-mono">Max: 94°C</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className={`h-full ${node.telemetryMetrics.junctionTempC > 85 ? "bg-rose-500" : "bg-amber-400"}`} 
                                style={{ width: `${(node.telemetryMetrics.junctionTempC / 100) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/60 p-2.5 rounded flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Voltage Ripple (mV)</span>
                            <div className="flex items-baseline justify-between mt-1">
                              <strong className={`text-base font-bold ${node.telemetryMetrics.voltageRippleMv > 150 ? "text-rose-400" : "text-sky-400"}`}>
                                {node.telemetryMetrics.voltageRippleMv} mV
                              </strong>
                              <span className="text-[9px] text-slate-500 font-mono">Limit: 120mV</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className={`h-full ${node.telemetryMetrics.voltageRippleMv > 150 ? "bg-rose-500" : "bg-sky-400"}`} 
                                style={{ width: `${Math.min(100, (node.telemetryMetrics.voltageRippleMv / 200) * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/60 p-2.5 rounded flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Fan Duty Cycle (RPM)</span>
                            <div className="flex items-baseline justify-between mt-1">
                              <strong className="text-base font-bold text-slate-200">
                                {node.telemetryMetrics.fanSpeedRpm.toLocaleString()} RPM
                              </strong>
                              <span className="text-[9px] text-slate-500 font-mono">100% Speed</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                              <div className="h-full bg-nvidia-green" style={{ width: '92%' }}></div>
                            </div>
                          </div>

                          <div className="bg-[#05080e] border border-nvidia-border/60 p-2.5 rounded flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">PCIe ECC Errors / sec</span>
                            <div className="flex items-baseline justify-between mt-1">
                              <strong className={`text-base font-bold ${node.telemetryMetrics.pcieEccErrorsSec > 10 ? "text-amber-400" : "text-emerald-400"}`}>
                                {node.telemetryMetrics.pcieEccErrorsSec} /s
                              </strong>
                              <span className="text-[9px] text-slate-500 font-mono">Tolerance: 5 /s</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className={`h-full ${node.telemetryMetrics.pcieEccErrorsSec > 10 ? "bg-amber-400" : "bg-emerald-400"}`} 
                                style={{ width: `${Math.min(100, (node.telemetryMetrics.pcieEccErrorsSec / 30) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* SENSING POINT OF FAILURE & PREDICTIVE CHART */}
                        <div className="bg-[#05080e] border border-nvidia-border/60 p-3 rounded flex flex-col gap-3">
                          <div className="flex items-center justify-between border-b border-nvidia-border/30 pb-2">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-nvidia-green" />
                              <span className="text-xs font-mono font-bold text-white uppercase">6-Day Telemetry Degradation & Point-of-Failure Trajectory</span>
                            </div>
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                              PREDICTED FAULT: IN {node.predictedFailureTimeHours} HOURS
                            </span>
                          </div>

                          {/* RECHARTS TREND CHART */}
                          <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={node.historicalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 200]} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1f293d", borderRadius: "6px", fontSize: "11px" }}
                                  itemStyle={{ color: "#e2e8f0" }}
                                />
                                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                                <Line type="monotone" dataKey="voltage" name="Voltage Ripple Spike (mV)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="temp" name="Junction Temp (°C)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="health" name="Node Health Index (%)" stroke="#76b900" strokeWidth={2} dot={{ r: 3 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* IMMINENT POINT OF FAILURE INSIGHT CALLOUT */}
                          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-xs text-amber-300 font-semibold block uppercase">
                                  NVSentinel Imminent Failure Insight
                                </strong>
                                <p className="text-[11px] text-slate-300 leading-normal font-sans mt-0.5">
                                  {node.imminentFailureReason}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-[9px] font-mono text-slate-400 block uppercase">Recommended AI Route:</span>
                              <span className="text-xs font-mono font-bold text-nvidia-green uppercase">
                                {node.recommendedAction}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PROACTIVE ACTION & DISPATCH ENGINE */}
                        <div className="bg-[#05080e] border border-nvidia-border/60 p-3.5 rounded flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-nvidia-green" />
                            <h5 className="text-xs font-mono text-white uppercase font-bold tracking-wider">
                              Proactive Resolution & Dispatch Hub
                            </h5>
                          </div>

                          <p className="text-[11px] text-slate-400 font-sans">
                            Take automated pre-emptive action to resolve hardware point-of-failure before service disruption occurs in customer cluster:
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {/* ACTION 1: DISPATCH REPLACEMENT */}
                            <button
                              onClick={() => {
                                setSentinelProactiveActionStatus(prev => ({ ...prev, [node.id]: "dispatched" }));
                                setSentinelActionNotification(
                                  `PROACTIVE WARRANTY DISPATCH INITIATED: Replacement ${node.nodeType} board shipped via priority logistics to ${node.clusterName}. Claim ID #NVS-${Math.floor(100000 + Math.random() * 900000)} under 36M Warranty.`
                                );
                                setTerminalFeed(prev => [
                                  ...prev,
                                  `[NVSentinel] PROACTIVE DISPATCH: Priority warranty shipment authorized for ${node.clusterName} (S/N: ${node.serialNumber}).`
                                ]);
                              }}
                              className={`p-3 rounded border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                                currentStatus === "dispatched"
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                  : "bg-[#090d16] border-nvidia-border hover:border-nvidia-green text-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-nvidia-green font-bold uppercase">Option A: Warranty Dispatch</span>
                                <CheckCircle2 className="h-3.5 w-3.5 text-nvidia-green" />
                              </div>
                              <strong className="text-xs font-bold text-white">Dispatch Replacement Board</strong>
                              <span className="text-[10px] text-slate-400 leading-normal">
                                Ships replacement under active 36M warranty prior to failure.
                              </span>
                            </button>

                            {/* ACTION 2: INITIATE REPAIR REQUEST */}
                            <button
                              onClick={() => {
                                setSentinelProactiveActionStatus(prev => ({ ...prev, [node.id]: "scheduled" }));
                                setSentinelActionNotification(
                                  `PROACTIVE REPAIR INITIATED: Field service ticket #SRV-${Math.floor(100000 + Math.random() * 900000)} scheduled for maintenance window at ${node.clusterName}.`
                                );
                                setTerminalFeed(prev => [
                                  ...prev,
                                  `[NVSentinel] PROACTIVE REPAIR: Certified field technician scheduled for off-peak maintenance at ${node.clusterName}.`
                                ]);
                              }}
                              className={`p-3 rounded border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                                currentStatus === "scheduled"
                                  ? "bg-sky-500/20 border-sky-500 text-sky-300"
                                  : "bg-[#090d16] border-nvidia-border hover:border-sky-400 text-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-sky-400 font-bold uppercase">Option B: Field Repair</span>
                                <Wrench className="h-3.5 w-3.5 text-sky-400" />
                              </div>
                              <strong className="text-xs font-bold text-white">Initiate Proactive Repair</strong>
                              <span className="text-[10px] text-slate-400 leading-normal">
                                Schedules field service repair window before complete breakdown.
                              </span>
                            </button>

                            {/* ACTION 3: CUSTOMER IMMINENT FAILURE ALERT */}
                            <button
                              onClick={() => {
                                setSentinelProactiveActionStatus(prev => ({ ...prev, [node.id]: "alerted" }));
                                setSentinelActionNotification(
                                  `CUSTOMER NOTIFICATION DISPATCHED: Telemetry warning alert & advisory guide transmitted to operations lead at ${node.clusterName}.`
                                );
                                setTerminalFeed(prev => [
                                  ...prev,
                                  `[NVSentinel] CUSTOMER ALERT: Transmitted telemetry health report & point-of-failure alert to customer operations lead.`
                                ]);
                              }}
                              className={`p-3 rounded border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                                currentStatus === "alerted"
                                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                  : "bg-[#090d16] border-nvidia-border hover:border-amber-400 text-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">Option C: Ops Advisory</span>
                                <Bell className="h-3.5 w-3.5 text-amber-400" />
                              </div>
                              <strong className="text-xs font-bold text-white">Alert Customer Operations</strong>
                              <span className="text-[10px] text-slate-400 leading-normal">
                                Sends data center lead real-time warning & mitigation guidance.
                              </span>
                            </button>
                          </div>

                          {/* CONFIRMATION BANNER */}
                          {sentinelActionNotification && (
                            <div className="bg-nvidia-green/10 border border-nvidia-green/40 p-3 rounded flex items-center justify-between text-xs text-nvidia-green animate-in fade-in duration-200">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-nvidia-green shrink-0" />
                                <span className="font-mono text-[11px] leading-normal">{sentinelActionNotification}</span>
                              </div>
                              <button
                                onClick={() => setSentinelActionNotification(null)}
                                className="text-[10px] uppercase font-bold text-slate-400 hover:text-white underline cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {activeTab === "demand-sensing" && (
              <motion.div
                key="demand-sensing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* DEMAND SENSING INPUTS */}
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                  <HeaderWithInfo 
                    title="Dynamic Demand Sensing"
                    subtitle="Ingest instant, high-impact orders to detect sudden demand spikes and adjust supply expectations automatically."
                    tooltip="Dynamic Demand Sensing captures sudden market demand shifts before traditional long-term forecasts catch up. WHAT IT DOES: It evaluates new high-volume customer orders to analyze whether they represent genuine structural demand spikes or temporary order noise. HOW TO USE IT: 1. Select a preset scenario or customize the target product, customer, order volume, and spike percentage above. 2. Click 'Execute' to run the AI model. 3. Review the updated reforecast chart and AI analysis comparing baseline expectations against the new demand curve."
                  />

                  {/* Preset Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {DEMAND_SENSING_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSensingSelectedPreset(p.id)}
                        className={`text-xs text-left p-2 rounded border transition-all ${
                          sensingSelectedPreset === p.id
                            ? "bg-nvidia-green/10 border-nvidia-green text-white"
                            : "bg-[#090d16] border-nvidia-border text-slate-400 hover:bg-slate-800/20"
                        }`}
                      >
                        <strong className="block text-[11px] truncate">{p.label}</strong>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <HoverFieldLabel 
                        label="NVIDIA Product Target" 
                        tooltip="The exact GPU device or server cabinet model affected by the new demand signal." 
                      />
                      <input
                        type="text"
                        value={sensingProductName}
                        onChange={(e) => setSensingProductName(e.target.value)}
                        className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <HoverFieldLabel 
                        label="Hyperscaler Client" 
                        tooltip="The cloud hosting partner or enterprise group initiating the massive cluster requirement." 
                      />
                      <input
                        type="text"
                        value={sensingHyperscaler}
                        onChange={(e) => setSensingHyperscaler(e.target.value)}
                        className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <HoverFieldLabel 
                        label="Signal Volume (Units)" 
                        tooltip="The physical quantum volume of accelerator boards or modules demanded in this sudden signal event." 
                      />
                      <input
                        type="number"
                        value={sensingVolumeUnits}
                        onChange={(e) => setSensingVolumeUnits(Number(e.target.value))}
                        className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <HoverFieldLabel 
                        label="Channel Deviation (%)" 
                        tooltip="The percentage spike representing how far this signal deviates above the statistical base channel expectations." 
                      />
                      <input
                        type="number"
                        value={sensingSpikePct}
                        onChange={(e) => setSensingSpikePct(Number(e.target.value))}
                        className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <HoverFieldLabel 
                        label="Urgency Level Code" 
                        tooltip="The priority tier of the client's order, determining if express flight expediting is triggered." 
                      />
                      <select
                        value={sensingUrgency}
                        onChange={(e) => setSensingUrgency(e.target.value)}
                        className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => executeAgent("demand-sensing", { productName: sensingProductName, hyperscaler: sensingHyperscaler, signalSpikePct: sensingSpikePct, signalVolumeUnits: sensingVolumeUnits, urgencyCode: sensingUrgency })}
                    disabled={activeTabStatus["demand-sensing"] === "running"}
                    className="w-full bg-nvidia-green hover:bg-[#8fd100] text-black font-bold uppercase tracking-wider py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {activeTabStatus["demand-sensing"] === "running" ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Running Anomaly Filter Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-black" />
                        <span>Execute</span>
                      </>
                    )}
                  </button>
                </div>

                {/* SENSING OUTPUT AND RECHARTS COMPARISON */}
                {sensingResult && (
                  <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-nvidia-border/60 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-nvidia-green uppercase tracking-wider">AI vs Traditional S&OP Comparison</span>
                        <h4 className="font-bold text-white text-base">1–13 Week Demand Reforecast Chart</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-nvidia-gray">ANOMALY VALIDATED</span>
                        <span className={`block font-bold text-xs px-2 py-0.5 rounded ${sensingResult.anomalyDetected ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"}`}>
                          {sensingResult.anomalyDetected ? "ANOMALY FOUND" : "REGULAR WAVE"}
                        </span>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-56 w-full text-xs bg-[#090d16] border border-nvidia-border p-2 rounded">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={sensingResult.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="week" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#f3f4f6" }} />
                          <Legend />
                          <Area type="monotone" dataKey="rawSignal" name="Spike Signal (Distributed)" fill="#ea580c" stroke="#ea580c" fillOpacity={0.12} />
                          <Line type="monotone" dataKey="aiReforecast" name="Neural AI Reforecast" stroke="#76b900" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="statisticalBaseline" name="Exp Smoothing Baseline" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5 5" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-[#090d16] border border-nvidia-border/60 p-3.5 rounded text-xs leading-normal flex flex-col gap-2.5">
                      <div>
                        <strong className="text-nvidia-green block mb-1 font-mono uppercase text-[11px] tracking-wide font-bold">
                          AI Anomaly & Demand Assessment
                        </strong>
                        <p className="text-slate-300 leading-relaxed font-sans">{sensingResult.anomalyAnalysis}</p>
                      </div>
                      <div className="border-t border-nvidia-border/40 pt-2">
                        <p className="text-slate-300 leading-relaxed font-sans">
                          <strong className="text-slate-200">AI Reforecast Summary: </strong>
                          {sensingResult.reforecastSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "demand-forecast" && (
              <motion.div
                key="demand-forecast"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* DEMAND FORECAST INPUTS */}
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                  <HeaderWithInfo 
                    title="Demand Forecasting & S&OP"
                    subtitle="Conduct sales and operations planning cycles by combining historical shipment data with team sales overrides."
                    tooltip="This module brings together historical sales trends and team inputs from sales and marketing. It predicts upcoming product demand over 26 weeks, helping teams align production schedules and avoid stock shortages or oversupply."
                  />

                      {/* Preset Selector */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {DEMAND_FORECAST_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setForecastSelectedPreset(p.id)}
                            className={`text-xs text-left p-2 rounded border transition-all ${
                              forecastSelectedPreset === p.id
                                ? "bg-nvidia-green/10 border-nvidia-green text-white"
                                : "bg-[#090d16] border-nvidia-border text-slate-400 hover:bg-slate-800/20"
                            }`}
                          >
                            <strong className="block text-[11px] truncate text-white">{p.label}</strong>
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <HoverFieldLabel 
                            label="Established GPU Product" 
                            tooltip="Select or enter the active product line to pull past shipment and inventory logs from." 
                          />
                          <input
                            type="text"
                            value={forecastProductName}
                            onChange={(e) => setForecastProductName(e.target.value)}
                            className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <HoverFieldLabel 
                            label="Statistical History Depth" 
                            tooltip="The depth of historic shipment datasets parsed by our time-series models." 
                          />
                          <select
                            value={forecastHistoryYears}
                            onChange={(e) => setForecastHistoryYears(Number(e.target.value))}
                            className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                          >
                            <option value={1}>1 Year History Ingestion</option>
                            <option value={2}>2 Years History Ingestion</option>
                            <option value={3}>3 Years History Ingestion</option>
                          </select>
                        </div>
                      </div>

                      {/* Adjust Sliders for overrides */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-nvidia-border/55 pt-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <HoverFieldLabel 
                              label="Sales Override Target" 
                              tooltip="Manual volume adjustment requested by regional field sales heads." 
                            />
                            <strong className="text-nvidia-green font-mono">{forecastSalesOverride > 0 ? "+" : ""}{forecastSalesOverride.toLocaleString()}</strong>
                          </div>
                          <input
                            type="range"
                            min="-5000"
                            max="20000"
                            step="500"
                            value={forecastSalesOverride}
                            onChange={(e) => setForecastSalesOverride(Number(e.target.value))}
                            className="w-full accent-nvidia-green"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <HoverFieldLabel 
                              label="Marketing Override" 
                              tooltip="Volume adjustments based on upcoming marketing campaign promotions and demand generation." 
                            />
                            <strong className="text-indigo-400 font-mono">{forecastMarketingOverride > 0 ? "+" : ""}{forecastMarketingOverride.toLocaleString()}</strong>
                          </div>
                          <input
                            type="range"
                            min="-10000"
                            max="10000"
                            step="500"
                            value={forecastMarketingOverride}
                            onChange={(e) => setForecastMarketingOverride(Number(e.target.value))}
                            className="w-full accent-nvidia-green"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => executeAgent("demand-forecast", { productName: forecastProductName, salesOverrideUnits: forecastSalesOverride, marketingOverrideUnits: forecastMarketingOverride, shipmentHistoryYears: forecastHistoryYears })}
                        disabled={activeTabStatus["demand-forecast"] === "running"}
                        className="w-full bg-nvidia-green hover:bg-[#8fd100] text-black font-bold uppercase tracking-wider py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {activeTabStatus["demand-forecast"] === "running" ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Decomposing Seasonal Factors...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-black" />
                            <span>Run S&OP Seasonal Consensus</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* DEMAND FORECAST CONSOLIDATION COMPONENT */}
                    {forecastResult && (
                      <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-nvidia-border/60 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-nvidia-green uppercase tracking-wider">Multiplicative Seasonal Decomposition</span>
                            <h4 className="font-bold text-white text-base">Consensus Review: 26-Week Supply Chart</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-nvidia-gray">S&OP ALIGNMENT</span>
                            <span className="block font-bold text-xs text-nvidia-green font-mono">
                              {forecastResult.confidenceScore}% Consensus
                            </span>
                          </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-52 w-full text-xs bg-[#090d16] border border-nvidia-border p-2 rounded">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastResult.forecastData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                              <XAxis dataKey="week" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                              <Legend />
                              <Line type="monotone" dataKey="consensusForecast" name="Adjusted Consensus S&OP" stroke="#76b900" strokeWidth={2.5} dot={false} />
                              <Line type="monotone" dataKey="baseForecast" name="Pure Historical Baseline" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 4" dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-normal">
                          <div className="bg-[#090d16] border border-nvidia-border/60 p-2.5 rounded">
                            <strong className="text-slate-200 block mb-1">Decomposition Trend</strong>
                            <p className="text-slate-400">{forecastResult.decompositionTrend}</p>
                          </div>
                          <div className="bg-[#090d16] border border-nvidia-border/60 p-2.5 rounded">
                            <strong className="text-slate-200 block mb-1">Seasonal Signature</strong>
                            <p className="text-slate-400">{forecastResult.decompositionSeasonal}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-normal border-t border-nvidia-border/40 pt-3">
                          <strong>Consensus S&OP Summary: </strong>{forecastResult.consensusSummary}
                        </p>
                      </div>
                    )}
              </motion.div>
            )}

            {activeTab === "forecast-npi" && (
              <motion.div
                key="forecast-npi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* NPI FORECAST INPUTS */}
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                  <HeaderWithInfo 
                    title="NPI Forecasting"
                    subtitle="Predict market adoption and production ramp curves for newly launched NVIDIA hardware products."
                    tooltip="This module handles New Product Introductions (NPI). When launching a brand-new product with no past sales history, AI compares multiple prediction models to forecast market adoption velocity and build an accurate production ramp curve."
                  />

                      {/* Preset Selector */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {FORECAST_NPI_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setNpiSelectedPreset(p.id)}
                            className={`text-xs text-left p-2 rounded border transition-all ${
                              npiSelectedPreset === p.id
                                ? "bg-nvidia-green/10 border-nvidia-green text-white"
                                : "bg-[#090d16] border-nvidia-border text-slate-400 hover:bg-slate-800/20"
                            }`}
                          >
                            <strong className="block text-[11px] truncate text-white">{p.label}</strong>
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5 md:col-span-1">
                          <label className="text-xs font-mono text-slate-300">NPI GPU Product</label>
                          <input
                            type="text"
                            value={npiProductName}
                            onChange={(e) => setNpiProductName(e.target.value)}
                            className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-slate-300">Adoption Speed</label>
                          <select
                            value={npiAdoptionRate}
                            onChange={(e) => setNpiAdoptionRate(e.target.value as any)}
                            className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                          >
                            <option value="High">High Adoption Velocity</option>
                            <option value="Moderate">Moderate Adoption Velocity</option>
                            <option value="Conservative">Conservative Adoption Velocity</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <HoverFieldLabel label="Primary Challenger Model" tooltip="Select the primary AI forecasting model methodology used to benchmark NPI ramp adoption curves." />
                          <select
                            value={npiSelectedModel}
                            onChange={(e) => setNpiSelectedModel(e.target.value)}
                            className="bg-[#090d16] border border-nvidia-border rounded px-3 py-1.5 text-xs text-white focus:border-nvidia-green focus:outline-none"
                          >
                            <option value="Pattern-Recognition Model">Pattern-Recognition Model</option>
                            <option value="Multi-Variable Analytics Model">Multi-Variable Analytics Model</option>
                            <option value="Trend Extrapolation Model">Trend Extrapolation Model</option>
                          </select>
                        </div>

                        {/* Model Hover Tag Quick Reference Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 md:col-span-3">
                          <HoverModelTag 
                            name="Pattern-Recognition Model" 
                            description="Deep neural sequence model (LSTM) that identifies complex adoption patterns, non-linear demand spikes, and multi-stage launch cycles."
                            isActive={npiSelectedModel.includes("Pattern")}
                          />
                          <HoverModelTag 
                            name="Multi-Variable Analytics Model" 
                            description="Tree-ensemble model (XGBoost) that evaluates multiple external variables simultaneously, such as macro indicators, pricing tiers, marketing spend, and competitor launches."
                            isActive={npiSelectedModel.includes("Multi-Variable")}
                          />
                          <HoverModelTag 
                            name="Trend Extrapolation Model" 
                            description="Classical statistical time-series model (ARIMA) that extends historical sales baselines, autocorrelation, and linear growth trajectories."
                            isActive={npiSelectedModel.includes("Trend Extrapolation")}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => executeAgent("forecast-npi", { productName: npiProductName, selectedPrimaryModel: npiSelectedModel, marketAdoptionRate: npiAdoptionRate })}
                        disabled={activeTabStatus["forecast-npi"] === "running"}
                        className="w-full bg-nvidia-green hover:bg-[#8fd100] text-black font-bold uppercase tracking-wider py-3 px-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {activeTabStatus["forecast-npi"] === "running" ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Evaluating Pattern-Recognition vs Multi-Variable vs Extrapolation Models...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-black" />
                            <span>Execute</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* NPI FORECAST RAMP GRAPHIC OUTPUT */}
                    {npiResult && (
                      <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-nvidia-border/60 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-nvidia-green uppercase tracking-wider">Champion-Challenger Model Results</span>
                            <h4 className="font-bold text-white text-base">NPI Ramp-Up Selection & Warnings</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-nvidia-gray">SELECTED CHAMPION</span>
                            <span className="block font-bold text-xs text-nvidia-green font-mono">
                              {npiResult.championModel}
                            </span>
                          </div>
                        </div>

                        {/* Model comparison table */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-mono text-slate-300">Tested Models MAPE Error Ratings</h5>
                              <MapeInfoPopover />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Lower MAPE = Higher Model Precision</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            {npiResult.modelMetrics.map((m, idx) => (
                              <HoverModelMetricCard key={idx} m={m} />
                            ))}
                          </div>
                        </div>

                        {/* Hierarchical breakdown LINE CHART */}
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-mono text-slate-300">Hierarchical Node Target Allocations (Units)</h5>
                              <AllocationsInfoPopover />
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-mono">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-nvidia-green inline-block"></span> NA Hub
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> APAC Hub
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> EMEA Hub
                              </span>
                            </div>
                          </div>

                          {/* Regional Totals KPI Callouts */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#090d16] border border-nvidia-border/70 rounded p-2.5 font-mono">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">NA Hub Target</span>
                              <span className="text-sm font-bold text-nvidia-green">
                                {npiResult.hierarchicalForecast.reduce((acc, curr) => acc + curr.naUnits, 0).toLocaleString()} units
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">APAC Hub Target</span>
                              <span className="text-sm font-bold text-cyan-400">
                                {npiResult.hierarchicalForecast.reduce((acc, curr) => acc + curr.apacUnits, 0).toLocaleString()} units
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">EMEA Hub Target</span>
                              <span className="text-sm font-bold text-amber-400">
                                {npiResult.hierarchicalForecast.reduce((acc, curr) => acc + curr.emeaUnits, 0).toLocaleString()} units
                              </span>
                            </div>
                          </div>

                          {/* Recharts Line Chart */}
                          <div className="h-64 w-full bg-[#090d16] border border-nvidia-border/80 rounded p-3 pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart 
                                data={npiResult.hierarchicalForecast}
                                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                                <XAxis 
                                  dataKey="node" 
                                  stroke="#64748b" 
                                  fontSize={10} 
                                  tickLine={false}
                                  interval={0}
                                  tick={({ x, y, payload }) => (
                                    <g transform={`translate(${x},${y})`}>
                                      <text x={0} y={12} dy={4} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="monospace">
                                        {payload.value.length > 22 ? payload.value.substring(0, 20) + '...' : payload.value}
                                      </text>
                                    </g>
                                  )}
                                />
                                <YAxis 
                                  stroke="#64748b" 
                                  fontSize={10} 
                                  tickLine={false}
                                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#0d1320', 
                                    borderColor: '#2d3748', 
                                    borderRadius: '8px', 
                                    fontSize: '11px',
                                    color: '#f8fafc',
                                    fontFamily: 'monospace',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)'
                                  }}
                                  formatter={(value: any, name: any) => [
                                    `${Number(value).toLocaleString()} units`, 
                                    name === 'naUnits' ? 'North America Hub' : name === 'apacUnits' ? 'APAC Hub' : 'EMEA Hub'
                                  ]}
                                  labelStyle={{ color: '#76b900', fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="naUnits" 
                                  name="naUnits" 
                                  stroke="#76b900" 
                                  strokeWidth={3} 
                                  dot={{ r: 4, fill: '#0d1320', stroke: '#76b900', strokeWidth: 2 }}
                                  activeDot={{ r: 6, fill: '#76b900' }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="apacUnits" 
                                  name="apacUnits" 
                                  stroke="#38bdf8" 
                                  strokeWidth={3} 
                                  dot={{ r: 4, fill: '#0d1320', stroke: '#38bdf8', strokeWidth: 2 }}
                                  activeDot={{ r: 6, fill: '#38bdf8' }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="emeaUnits" 
                                  name="emeaUnits" 
                                  stroke="#f59e0b" 
                                  strokeWidth={3} 
                                  dot={{ r: 4, fill: '#0d1320', stroke: '#f59e0b', strokeWidth: 2 }}
                                  activeDot={{ r: 6, fill: '#f59e0b' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Low confidence flags list with rich explainability cards */}
                        {npiResult.lowConfidenceFlags.length > 0 && (
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-mono text-rose-400 flex items-center gap-1.5 font-bold">
                                <AlertTriangle className="h-4 w-4" /> Low Confidence Flagged Items & Root Cause Analysis
                              </h5>
                              <span className="text-[10px] font-mono text-rose-300/80 bg-rose-950/60 border border-rose-500/20 px-2 py-0.5 rounded">
                                Governance Threshold: &lt; 80% Confidence
                              </span>
                            </div>
                            <div className="space-y-3">
                              {npiResult.lowConfidenceFlags.map((f, idx) => (
                                <LowConfidenceExplainabilityCard key={idx} f={f} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
              </motion.div>
            )}

            {/* TAB END */}

            {activeTab === "activity-log" && (
              <motion.div
                key="activity-log"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                <div className="bg-nvidia-card border border-nvidia-border rounded-lg p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-nvidia-border/60 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-nvidia-green uppercase tracking-wider">System Event Feed</span>
                      <h3 className="font-bold text-white text-lg">Central System Activity Log</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#090d16] border border-nvidia-border text-nvidia-green">
                      {systemLogs.length} Records Ingested
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal">
                    This is the centralized audit stream of all LLM agent reasoning, decision executions, API request calls, and physical supply chain routing recommendations.
                  </p>

                  <div className="p-4 bg-black rounded border border-nvidia-border text-[11px] font-mono text-slate-300 h-[500px] overflow-y-auto terminal-scroll space-y-2 leading-relaxed">
                    {systemLogs.map((log, idx) => {
                      const time = log.substring(1, 9);
                      const tagEnd = log.indexOf("]");
                      const tag = tagEnd !== -1 ? log.substring(11, tagEnd) : "";
                      const rest = tagEnd !== -1 ? log.substring(tagEnd + 1) : log;
                      return (
                        <div key={idx} className="hover:bg-slate-800/20 px-2 py-1 rounded transition-colors border-b border-neutral-900/40 flex items-start gap-2">
                          <span className="text-slate-500 shrink-0 select-none">[{time}]</span>
                          {tag && <span className="text-nvidia-green font-semibold shrink-0 select-none">[{tag}]</span>}
                          <span className="text-slate-200">{rest}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>



      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-nvidia-border/60 bg-[#090d16] text-[11px] font-mono text-nvidia-gray py-3 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        </div>
      </footer>
    </div>
  );
}

// Custom clock subcomponent for dynamic time formatting in real time
function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-white font-semibold">{time}</span>;
}
