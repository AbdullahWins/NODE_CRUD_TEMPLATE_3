// DTOs/adminDTO.js

class AdminLoginDTO {
  constructor(admin, token) {
    this._id = admin._id;
    this.name = admin.name;
    this.email = admin.email;
    this.token = token;
  }
}

class AdminRegisterDTO {
  constructor(admin, token) {
    this._id = admin._id;
    this.name = admin.name;
    this.email = admin.email;
    this.token = token;
  }
}

class AdminFetchDTO {
  constructor(admin) {
    this._id = admin._id;
    this.name = admin.name;
    this.email = admin.email;
  }
}

class AdminUpdateDTO {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class AdminDeleteDTO {
  constructor(admin) {
    this._id = admin._id;
    this.name = admin.name;
    this.email = admin.email;
  }
}

module.exports = {
  AdminLoginDTO,
  AdminRegisterDTO,
  AdminFetchDTO,
  AdminUpdateDTO,
  AdminDeleteDTO,
};
