const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  constructor() {
    this.users = [];
  }

  async register({ email, password, name }) {
    const existing = this.users.find((user) => user.email === email);
    if (existing) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  async login({ email, password }) {
    const user = this.users.find((candidate) => candidate.email === email);
    if (!user) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  getById(id) {
    return this.users.find((user) => user.id === id);
  }
}

const userModel = new UserModel();

module.exports = { userModel };

