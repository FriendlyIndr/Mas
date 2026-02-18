import { DataTypes } from 'sequelize';
import db from "../db.js";
import User from './User.js';
import TaskSeries from './TaskSeries.js';

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
        allowNull: true,
    },
    seriesId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'TaskSeries',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    indexes: [
        { fields: ['userId', 'date'] },
        { fields: ['userId', 'seriesId'] },
    ]
});

Task.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'userId' });

Task.belongsTo(TaskSeries, { foreignKey: 'seriesId' });
TaskSeries.hasMany(Task, { foreignKey: 'seriesId' });

export default Task;