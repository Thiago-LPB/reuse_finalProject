import fetch from "node-fetch";

export default function authRoutes(app) {
  // SignUp
  app.get("/signUp", (req, res) => res.render("signUp.ejs"));

  app.post("/signUp", async (req, res) => {
    const { email, password, "confirm-password": confirmPassword } = req.body;

    const valid = password.match(/[0-9]/) &&
      password.match(/[a-z]/) &&
      password.match(/[A-Z]/) &&
      password.length >= 6;

    if (!valid || password !== confirmPassword) {
      return res.render("signUp.ejs", { error: "Senha inválida ou não confere" });
    }

    const response = await fetch("http://localhost:8082/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) return res.render("signUp.ejs", { error: data.error });

    req.session.user = email;
    res.redirect("/");
  });

  // Login
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const response = await fetch(`http://localhost:8082/users/${email}`);
    if (!response.ok) return res.redirect("/");
    const user = await response.json();
    if (user.password === password) {
      req.session.user = email;
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  });

  // Logout
  app.post("/logOut", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
  });
}
