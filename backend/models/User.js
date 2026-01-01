import { DataTypes } from "sequelize";
import db from "../db";

db.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,  
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default User;