import path from "path";

export function setupViews(app, dirname) {
  app.set("views", path.join(dirname, "../../views"));
  app.set("view engine", "ejs");
}
