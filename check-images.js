require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

async function checkImages() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'local_b2b_2'
    });

    console.log('Connected to database:', process.env.DB_NAME);
    
    const [rows] = await connection.execute(
      'SELECT id, name, images FROM products WHERE images IS NOT NULL AND images != "" LIMIT 5'
    );

    console.log('\n=== Products with Images ===');
    rows.forEach(product => {
      console.log(`\nID: ${product.id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Images (raw): ${product.images}`);
      
      try {
        const parsedImages = JSON.parse(product.images);
        console.log(`Images (parsed):`, parsedImages);
      } catch (e) {
        console.log(`Images (parse error): ${e.message}`);
      }
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkImages();
