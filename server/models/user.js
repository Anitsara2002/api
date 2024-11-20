'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    firstName: { type : DataTypes.STRING, validate: {notEmpty: true}},
    lastName:{ type : DataTypes.STRING, validate: {notEmpty: true}},
    email: { type : DataTypes.STRING, validate: {isEmail: true}},
    password: { type : DataTypes.STRING, validate: { len : [4, 20] }},
    birthDate: { type : DataTypes.STRING, validate: {isDate: true}},
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};