import { DataTypes } from "sequelize";
import db from "../db.js";
import User from './User.js';

const RefreshToken = db.define('RefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    tokenHash: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: true,
    updatedAt: false,
});

RefreshToken.belongsTo(User, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});
User.hasMany(RefreshToken, { foreignKey: 'userId' });

export default RefreshToken;