'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Predictdata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Predictdata.init({
    time: DataTypes.DATE,
    dust: DataTypes.STRING,
    rain_ratio: DataTypes.STRING,
    clean_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Predictdata',
  });
  return Predictdata;
};