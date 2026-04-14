const { sequelize } = require('../config/db');
const imageStorage = require('./imageStorage');

async function validateAndFixProductImages() {
  try {
    console.log('🔍 Validating product images...');
    
    // Get all products with images
    const [products] = await sequelize.query(`
      SELECT id, images FROM products WHERE images IS NOT NULL AND images != 'null'
    `);

    let fixedCount = 0;
    let totalProducts = products.length;

    for (const product of products) {
      let images = [];
      
      try {
        // Parse JSON images
        if (typeof product.images === 'string') {
          images = JSON.parse(product.images);
        } else {
          images = product.images || [];
        }

        // Validate each image URL
        const validImages = imageStorage.validateImageUrls(images);
        
        // If some images are missing, update the product
        if (validImages.length !== images.length) {
          await sequelize.query(`
            UPDATE products SET images = ? WHERE id = ?
          `, {
            replacements: [JSON.stringify(validImages), product.id]
          });
          
          fixedCount++;
          console.log(`✅ Fixed product ${product.id}: ${images.length} → ${validImages.length} images`);
        }
      } catch (error) {
        console.error(`❌ Error processing product ${product.id}:`, error.message);
        
        // Set empty images array for corrupted data
        await sequelize.query(`
          UPDATE products SET images = '[]' WHERE id = ?
        `, {
          replacements: [product.id]
        });
        fixedCount++;
      }
    }

    console.log(`✅ Image validation complete: ${fixedCount}/${totalProducts} products fixed`);
    return { totalProducts, fixedCount };
    
  } catch (error) {
    console.error('❌ Error validating images:', error);
    throw error;
  }
}

// Run validation on startup
async function runStartupValidation() {
  try {
    await validateAndFixProductImages();
  } catch (error) {
    console.error('Startup image validation failed:', error);
  }
}

module.exports = {
  validateAndFixProductImages,
  runStartupValidation
};
