import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { mqttClient } from "./mqtt";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for the frontend origin
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

import { storage } from "./storage";

(async () => {
  // Data initialization
  try {
    log("Initializing test data...");
    const household = await storage.getOrCreateHousehold("Casa de Prueba");
    const user = await storage.getOrCreateUser("mauro", "123456", "mauro@kittypaw.com", household.id);
    console.log("User object after getOrCreateUser:", user);
    const pet = await storage.getOrCreatePet("Mishifu", household.id);
    const device = await storage.getOrCreateDevice("KPCL0022", "Comedero de Mishifu", "comedero", household.id);
    await storage.associatePetToDevice(pet.id, device.id);
    
    // Load and connect MQTT with the test user's ID
    await mqttClient.loadAndConnect(user.id);
    log("Test data initialized successfully.");
  } catch (error) {
    log(`Error initializing test data: ${(error as Error).stack}`, "error");
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
