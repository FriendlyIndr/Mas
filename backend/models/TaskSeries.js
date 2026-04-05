import { DataTypes } from "sequelize";
import db from "../db.js";
import User from "./User.js";

const TaskSeries = db.define('TaskSeries', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rrule: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },

    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'TaskSeries',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    indexes: [
        { fields: ['userId', 'startDate'] },
        { fields: ['userId', 'endDate'] },
        { fields: ['parentId'] },
    ],
    freezeTableName: true,
});

TaskSeries.hasMany(TaskSeries, {
    as: "subtasks",
    foreignKey: "parentId"
});

TaskSeries.belongsTo(TaskSeries, {
    as: "parent",
    foreignKey: "parentId"
});

TaskSeries.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(TaskSeries, { foreignKey: 'userId' });

export default TaskSeries;