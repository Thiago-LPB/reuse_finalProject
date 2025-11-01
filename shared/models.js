export class User {
  constructor(email, password, gamesOwned = [], gamesPosted = [], cart = [], money = 50) {
    this.email = email;
    this.password = password;
    this.gamesOwned = gamesOwned;
    this.gamesPosted = gamesPosted;
    this.cart = cart;
    this.money = money;
  }

  cartPrice() {
    return this.cart.reduce((total, g) => total + parseFloat(g.price), 0);
  }
}

export class Game {
  constructor(name, price, img) {
    this.name = name;
    this.price = parseFloat(price);
    this.img = img;
  }
}
