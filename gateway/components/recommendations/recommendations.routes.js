import fetch from "node-fetch";

export default function recommendationsRoutes(app) {
  app.get("/recommendations", async (req, res) => {
    if (!req.session.user) return res.redirect("/");

    try {
      const [recommendationsResponse, statsResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:8084/recommendations/${req.session.user}?limit=20`),
        fetch(`http://localhost:8084/recommendations/stats/${req.session.user}`),
        fetch(`http://localhost:8082/users/${req.session.user}`),
      ]);

      const recommendations = await recommendationsResponse.json();
      const stats = await statsResponse.json();
      const user = await userResponse.json();

      res.render("recommendations.ejs", {
        recommendations,
        stats,
        User: req.session.user,
        cartSize: user.cart.length,
      });
    } catch (error) {
      console.error("Erro ao carregar recomendações:", error);
      res.status(500).send("Erro ao carregar recomendações");
    }
  });
}
