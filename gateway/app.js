import { createServer } from "./core/server.js";
import { registerComponent } from "./core/server.js";

import homeRoutes from "./components/home/home.routes.js";
import authRoutes from "./components/auth/auth.routes.js";
import gamesRoutes from "./components/games/games.routes.js";
import cartRoutes from "./components/cart/cart.routes.js";
import recommendationsRoutes from "./components/recommendations/recommendations.routes.js";

// Cria app com middlewares fixos
const app = createServer();

// Registra componentes (pontos de modificação)
registerComponent(app, homeRoutes);
registerComponent(app, authRoutes);
registerComponent(app, gamesRoutes);
registerComponent(app, cartRoutes);
registerComponent(app, recommendationsRoutes);

// Inicia servidor
app.start();
