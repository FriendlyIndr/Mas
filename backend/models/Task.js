import { DataTypes } from 'sequelize';
import db from "../db.js";
import User from './User.js';

const Task = db.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    done: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull:true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
});

Task.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'userId' });

export default Task;