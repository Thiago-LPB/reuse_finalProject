import fetch from "node-fetch";

export default function gamesRoutes(app) {
  // Catálogo de jogos
  app.get("/games", async (req, res) => {
    try {
      const { category, search, sortBy, minPrice, maxPrice } = req.query;
      let url = "http://localhost:8085/games?";

      if (category) url += `category=${category}&`;
      if (search) url += `search=${search}&`;
      if (sortBy) url += `sortBy=${sortBy}&`;
      if (minPrice) url += `minPrice=${minPrice}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}&`;

      const [gamesResponse, categoriesResponse] = await Promise.all([
        fetch(url),
        fetch("http://localhost:8085/categories"),
      ]);

      const games = await gamesResponse.json();
      const categories = await categoriesResponse.json();

      let cartSize = 0;
      if (req.session.user) {
        const userResponse = await fetch(`http://localhost:8082/users/${req.session.user}`);
        const user = await userResponse.json();
        cartSize = user.cart.length;
      }

      res.render("games-catalog.ejs", {
        games,
        categories,
        User: req.session.user || null,
        cartSize,
        currentCategory: category || "",
        searchTerm: search || "",
      });
    } catch (error) {
      console.error("Erro ao carregar catálogo:", error);
      res.status(500).send("Erro ao carregar catálogo de jogos");
    }
  });

  // Detalhes de jogo
  app.get("/game/:id", async (req, res) => {
    try {
      const gameId = req.params.id;

      const [gameResponse, similarResponse] = await Promise.all([
        fetch(`http://localhost:8085/games/${gameId}`),
        fetch(`http://localhost:8084/recommendations/similar/${gameId}?limit=6`),
      ]);

      const game = await gameResponse.json();
      const similar = await similarResponse.json();

      let cartSize = 0;
      let userOwnsGame = false;
      let userEmail = null;

      if (req.session.user) {
        const userResponse = await fetch(`http://localhost:8082/users/${req.session.user}`);
        const user = await userResponse.json();
        cartSize = user.cart.length;
        userEmail = user.email;
        userOwnsGame = user.gamesOwned.some(g => g.id == gameId);

        await fetch("http://localhost:8084/recommendations/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: req.session.user, gameId }),
        });
      }

      res.render("game-details.ejs", {
        game,
        similar,
        User: userEmail,
        cartSize,
        userOwnsGame,
      });
    } catch (error) {
      console.error("Erro ao carregar detalhes do jogo:", error);
      res.status(500).send("Erro ao carregar detalhes do jogo");
    }
  });
}
