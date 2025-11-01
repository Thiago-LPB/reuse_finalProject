import fetch from "node-fetch";

export default function cartRoutes(app) {
  // Visualizar carrinho
  app.get("/cart", async (req, res) => {
    if (!req.session.user) return res.redirect("/");

    const email = req.session.user;
    const response = await fetch(`http://localhost:8082/users/${email}`);
    const user = await response.json();

    res.render("cart.ejs", {
      cart: user.cart,
      User: email,
      cartSize: user.cart.length,
      cartPrice: user.cart.reduce((s, g) => s + parseFloat(g.price), 0),
      money: user.money,
    });
  });

  app.post("/cart", (req, res) => res.redirect("/cart"));

  // Adicionar jogo
  app.post("/cart/add/:gameId", async (req, res) => {
    if (!req.session.user) return res.redirect("/");

    try {
      const { gameId } = req.params;
      const email = req.session.user;

      const response = await fetch("http://localhost:8083/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, gameId }),
      });

      const data = await response.json();
      if (response.ok) res.redirect("/cart");
      else res.status(400).send(data.error);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      res.status(500).send("Erro ao adicionar ao carrinho");
    }
  });

  // Remover jogo
  app.post("/cart/remove/:gameId", async (req, res) => {
    if (!req.session.user) return res.redirect("/");

    try {
      const { gameId } = req.params;
      const email = req.session.user;

      const response = await fetch(`http://localhost:8083/cart/remove/${email}/${gameId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) res.redirect("/cart");
      else res.status(400).send(data.error);
    } catch (error) {
      console.error("Erro ao remover do carrinho:", error);
      res.status(500).send("Erro ao remover do carrinho");
    }
  });

  // Checkout
  app.post("/cart/checkout", async (req, res) => {
    const email = req.session.user;
    const response = await fetch(`http://localhost:8082/users/${email}`);
    const user = await response.json();

    res.render("checkout.ejs", {
      cart: user.cart,
      User: email,
      cartSize: user.cart.length,
      cartPrice: user.cart.reduce((s, g) => s + parseFloat(g.price), 0),
      money: user.money,
      message: null,
      error: null,
    });
  });

  // Confirmar pagamento
  app.post("/cart/confirm", async (req, res) => {
    const email = req.session.user;
    const { paymentMethod } = req.body;

    const response = await fetch("http://localhost:8083/cart/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    const userResp = await fetch(`http://localhost:8082/users/${email}`);
    const user = await userResp.json();

    res.render("checkout.ejs", {
      cart: user.cart,
      User: email,
      cartSize: user.cart.length,
      cartPrice: user.cart.reduce((s, g) => s + parseFloat(g.price), 0),
      money: user.money,
      message: data.success ? `Pagamento via ${paymentMethod} realizado! ${data.message}` : null,
      error: !data.success ? data.message : null,
    });
  });

  // MyGames
  app.post("/mygames", async (req, res) => {
    const email = req.body.loggedUser;
    const response = await fetch(`http://localhost:8082/users/${email}`);
    const user = await response.json();

    res.render("mygames.ejs", {
      User: email,
      gamesOwned: user.gamesOwned || [],
      cartSize: user.cart.length,
    });
  });
}
