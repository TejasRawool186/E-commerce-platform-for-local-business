const fs = require('fs');
const path = require('path');

class ImageStorage {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadsDir();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // Check if image file exists
  imageExists(filename) {
    const filePath = path.join(this.uploadsDir, filename);
    return fs.existsSync(filePath);
  }

  // Get image path
  getImagePath(filename) {
    return path.join(this.uploadsDir, filename);
  }

  // Get image URL for frontend
  getImageUrl(filename) {
    return `/uploads/${filename}`;
  }

  // Validate image URLs from database
  validateImageUrls(imageUrls) {
    if (!Array.isArray(imageUrls)) return [];
    
    return imageUrls.filter(url => {
      if (typeof url !== 'string') return false;
      
      // Extract filename from URL
      const filename = url.replace('/uploads/', '');
      return this.imageExists(filename);
    });
  }

  // Clean up orphaned images (images not referenced in database)
  async cleanupOrphanedImages(referencedImages = []) {
    try {
      const files = fs.readdirSync(this.uploadsDir);
      const referencedFilenames = referencedImages.map(url => 
        url.replace('/uploads/', '')
      );

      for (const file of files) {
        if (!referencedFilenames.includes(file)) {
          const filePath = path.join(this.uploadsDir, file);
          fs.unlinkSync(filePath);
          console.log(`Cleaned up orphaned image: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned images:', error);
    }
  }

  // Delete specific image
  deleteImage(filename) {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}

module.exports = new ImageStorage();
