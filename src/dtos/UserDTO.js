// DTOs/UserDTO.js

class UserLoginDTO {
  constructor(user, token) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.token = token;
  }
}

class UserRegisterDTO {
  constructor(user, token) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.token = token;
  }
}

class UserFetchDTO {
  constructor(user) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
  }
}

class UserUpdateDTO {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class UserDeleteDTO {
  constructor(user) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
  }
}

module.exports = {
  UserLoginDTO,
  UserRegisterDTO,
  UserFetchDTO,
  UserUpdateDTO,
  UserDeleteDTO,
};
