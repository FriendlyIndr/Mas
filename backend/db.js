import { Sequelize } from "sequelize";

const node_env = process.env.NODE_ENV;
const isProduction = node_env === 'production';

const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_name = process.env.DB_NAME;
const db_host = process.env.DB_HOST;

const db_url = process.env.DB_URL;

if (isProduction && !db_url) {
    throw new Error('DB_URL is not set in production');
}

const db = isProduction 
    ? new Sequelize(db_url, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    })
    : new Sequelize(db_name, db_user, db_pass, {
        host: db_host,
        dialect: 'postgres',
      });

export default db;