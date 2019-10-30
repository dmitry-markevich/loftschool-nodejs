const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new schema({
    username: {
        type: String,
        required: [true, 'Укажите имя пользователя'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Укажите пароль пользователя']
    },
    permission: {
        type: String,
        required: [true, 'Укажите права пользователя']
    },
    firstName: {
        type: String
    },
    surName: {
        type: String
    },
    middleName: {
        type: String
    },
    image: {
        type: String
    },
    access_token: {
        type: String
    }
});

userSchema.methods.setPassword = function (password) {
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.setToken = function (token) {
    this.access_token = token;
};

userSchema.methods.getItem = function () {
    return {
        id: this._id,
        username: this.username,
        permission: JSON.parse(this.permission),
        permissionId: this._id,
        firstName: this.firstName,
        surName: this.surName,
        middleName: this.middleName,
        image: this.image,
        access_token: this.access_token
    }
}

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
