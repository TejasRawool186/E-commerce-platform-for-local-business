const fs = require('fs');
const path = require('path');

// Robust .env parsing
const envPath = path.resolve(__dirname, '../.env');
const envConfig = {};
try {
  const envFileContent = fs.readFileSync(envPath, 'utf8');
  envFileContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^"|"$/g, ''); // Remove surrounding quotes
        envConfig[key] = value;
      }
    }
  });
  console.log('Successfully loaded DB_USER:', envConfig.DB_USER);
} catch (error) {
  console.error('Failed to read .env file:', error);
  process.exit(1);
}
const { Sequelize, DataTypes } = require('sequelize');

// Define the Product model structure
const defineProductModel = (sequelize) => {
  return sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'products',
    timestamps: false
  });
};

// Main function to diagnose image paths
const diagnoseImages = async () => {
  const sequelize = new Sequelize(
    envConfig.DB_NAME,
    envConfig.DB_USER,
    envConfig.DB_PASSWORD, 
    {
      host: envConfig.DB_HOST,
      dialect: 'mysql'
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');

    const Product = defineProductModel(sequelize);

    const products = await Product.findAll({
      where: {
        images: { [Sequelize.Op.ne]: null }
      },
      limit: 5
    });

    if (products.length === 0) {
      console.log('No products with images found.');
      return;
    }

    console.log('\n--- Image Data Diagnosis ---');
    products.forEach(product => {
      console.log(`\n[Product ID: ${product.id}] Name: ${product.name}`);
      console.log(`  Raw 'images' data: ${product.images}`);
      try {
        const parsed = JSON.parse(product.images);
        console.log('  Parsed as JSON:', parsed);
      } catch (e) {
        console.log(`  Could not parse as JSON: ${e.message}`);
      }
    });

  } catch (error) {
    console.error('Unable to connect to the database or fetch data:', error);
  } finally {
    await sequelize.close();
  }
};

diagnoseImages();
