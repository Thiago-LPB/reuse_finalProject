import express from "express";
import Email from "./nodeMailer.js";

const app = express();
app.use(express.json());

app.post("/sendConfirmation", async (req, res) => {
  const { email, key } = req.body;
  const mail = new Email("Confirme seu e-mail", key, email);
  mail.send();
  res.json({ message: `E-mail de confirmação enviado para ${email}` });
});

app.listen(8083, () => console.log("Email Service rodando em http://localhost:8083"));
