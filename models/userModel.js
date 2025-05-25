const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const USER_FILE = path.join(__dirname, 'users.json');

class UserModel {
  constructor() {
    this._loadUsers();
  }

  _loadUsers() {
    try {
      const data = fs.readFileSync(USER_FILE, 'utf-8');
      this.users = JSON.parse(data);
    } catch (err) {
      this.users = [];
    }
  }

  _saveUsers() {
    fs.writeFileSync(USER_FILE, JSON.stringify(this.users, null, 2));
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  addUser({ email, password }) {
    // Generate a unique id
    let id;
    do {
      id = nanoid();
    } while (this.users.some(u => u.id === id));

    const user = { id, email, password }; 
    this.users.push(user);
    this._saveUsers();
    return user;
  }

  getUsers() {
    return this.users;
  }
}

module.exports = new UserModel();
