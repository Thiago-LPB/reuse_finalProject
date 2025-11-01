export class User {
  constructor(email, password, money = 0, gamesOwned = [], gamesPosted = [], cart = []) {
    this.email = email;
    this.password = password;
    this.gamesOwned = gamesOwned;
    this.gamesPosted = gamesPosted;
    this.cart = cart;
    this.money = money;
  }
}
