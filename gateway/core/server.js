import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { setupMiddlewares } from "./middlewares.js";
import { setupViews } from "./viewEngine.js";
import config from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  setupMiddlewares(app);
  setupViews(app, __dirname);

  app.start = () => {
    app.listen(config.port, config.host, () =>
      console.log(` Gateway rodando em ${config.host}:${config.port}`)
    );
  };

  return app;
}

// Permite registrar um componente modular
export function registerComponent(app, component) {
  if (typeof component === "function") {
    component(app);
  } else {
    console.warn("Componente inválido:", component);
  }
}
