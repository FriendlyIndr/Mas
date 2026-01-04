import { DataTypes } from "sequelize";
import db from "../db.js";

export default db.define('User', {
    userName: {
        type: DataTypes.STRING,
        allowNull: false,  
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});