import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { productsDatabase as initialProducts } from "./src/data";

// Import real agent runners
import { runRmaTriage, generateRmaDoc } from "./agents/rmaTriage.ts";
import { runDemandSensing } from "./agents/demandSensing.ts";
import { runDemandForecast } from "./agents/demandForecast.ts";
import { runForecastNpi } from "./agents/forecastAgentNpi.ts";
import { runRefurbRepair } from "./agents/refurbRepair.ts";
import { runOrchestrator } from "./agents/orchestrator.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware with 10MB limit (safety margin)
  app.use(express.json({ limit: "10mb" }));

  // Simulated Database Store (Ready for SQL/NoSQL connection flow)
  let productsDatabase = initialProducts;

  // API routes go here FIRST
  app.use("/api/*", (req, res, next) => {
    console.log(`[Server] API request: ${req.method} ${req.originalUrl}`);
    next();
  });

  // API Route: Get all hardware products
  app.get("/api/products", (req, res) => {
    res.json(productsDatabase);
  });

  // API Route: Simulate B200 Supply Draw (Database State Update)
  app.post("/api/products/simulate-draw", (req, res) => {
    productsDatabase = productsDatabase.map(p => {
      if (p.name === "Blackwell B200 HGX") {
        return { ...p, safetyStock: 12, bufferStatus: "DEPLETED - EMERGENCY RUN" };
      }
      if (p.name === "H200 NVL PCIe") {
        return { ...p, safetyStock: 28, bufferStatus: "CRITICAL LOW" };
      }
      return p;
    });
    res.json(productsDatabase);
  });

  // API Route: Generate Detailed RMA Document (Markdown format)
  app.post("/api/agents/generate-rma-doc", async (req, res) => {
    try {
      const {
        productName,
        serialNumber,
        defectDescription,
        disposition,
        warrantyStatus,
        warrantyDetails,
        confidenceScore,
        solvabilityRecommendation,
        approvedBy,
        designatedEmail
      } = req.body;

      const docText = await generateRmaDoc({
        productName,
        serialNumber,
        defectDescription,
        disposition,
        warrantyStatus,
        warrantyDetails,
        confidenceScore,
        solvabilityRecommendation,
        approvedBy,
        designatedEmail
      });

      res.json({ documentText: docText });
    } catch (err: any) {
      console.error("[Server] Error generating RMA document:", err);
      res.status(500).json({ error: err.message || "Failed to generate RMA document" });
    }
  });

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: Unified Agent Execution Pipeline
  app.post("/api/agents/run", async (req, res) => {
    const { agentId, payload } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: "agentId parameter is required" });
    }

    console.log(`[Orchestrator Tower] Received run signal for agent: ${agentId}`);
    console.log(`[Orchestrator Tower] Payload:`, JSON.stringify(payload));

    try {
      let result;
      switch (agentId) {
        case "rma-triage":
          console.log(`[Orchestrator Tower] Calling runRmaTriage`);
          result = await runRmaTriage(payload);
          console.log(`[Orchestrator Tower] runRmaTriage returned`);
          break;
        case "demand-sensing":
          result = await runDemandSensing(payload);
          break;
        case "demand-forecast":
          result = await runDemandForecast(payload);
          break;
        case "forecast-npi":
          result = await runForecastNpi(payload);
          break;
        case "refurb-repair":
          result = await runRefurbRepair(payload);
          break;
        case "orchestrator":
          result = await runOrchestrator(payload);
          break;
        default:
          return res.status(400).json({ error: `Unknown agentId: ${agentId}` });
      }

      console.log(`[Orchestrator Tower] Sending result for ${agentId}`);
      return res.json(result);
    } catch (error: any) {
      console.error(`[Orchestrator Tower] Error executing agent ${agentId}:`, error);
      return res.status(500).json({ 
        error: error.message || "An internal error occurred during agent execution",
        details: error.stack
      });
    }
  });

  // Setup Vite Dev Server / Static Production Server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Server] Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Server] Production static server mounted, serving dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] NVIDIA Multi-Agent Control Tower listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Critical startup error:", err);
  process.exit(1);
});
