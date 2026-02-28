import { DataTypes } from "sequelize";
import db from "../db.js";

const TaskException = db.define('TaskException', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    seriesId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'TaskSeries',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    overriddenDate: {
        type: DataTypes.DATEONLY
    },
    done: {
        type: DataTypes.BOOLEAN
    },
    order: {
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['seriesId', 'date'],
        },
        {
            fields: ['userId', 'date'],
        },
        {
            fields: ['seriesId', 'overriddenDate'],
        },
    ],
    timestamps: true,
    freezeTableName: true,
});

export default TaskException;