import fetch from "node-fetch";

export default function homeRoutes(app) {
  // Página inicial
  app.get("/", async (req, res) => {
    try {
      if (req.session.user) {
        const [userResponse, popularGamesResponse] = await Promise.all([
          fetch(`http://localhost:8082/users/${req.session.user}`),
          fetch("http://localhost:8084/recommendations/popular?limit=8"),
        ]);

        const user = await userResponse.json();
        const popularGames = await popularGamesResponse.json();

        return res.render("home.ejs", {
          User: user.email,
          cartSize: user.cart.length,
          popularGames: popularGames || [],
        });
      }

      res.render("index.ejs");
    } catch (error) {
      console.error("Erro na rota /:", error);
      res.status(500).send("Erro ao carregar a página inicial");
    }
  });
}
