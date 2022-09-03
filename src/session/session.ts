import {Model, DataTypes, InferAttributes, InferCreationAttributes} from 'sequelize';
import {sequelize} from '../storage/db';

export class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
  declare readonly sid: string;
  declare userId: string;
  declare expires: Date;
  declare data: string;
};

Session.init({
  sid: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  userId: DataTypes.STRING,
  expires: DataTypes.DATE,
  data: DataTypes.STRING
}, {sequelize, tableName: 'Sessions'});

export const initSession = async () => {
  await Session.sync({force: true});
  console.log('session tables created')
};