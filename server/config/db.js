const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'b2b_ecommerce',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true,
      underscored: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected');
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
