const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (mock implementation for development)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'helensvale-connect',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_api_secret'
});

// Upload image to Cloudinary
const uploadToCloudinary = async (file, folder = 'vendors') => {
  try {
    // Mock implementation for development
    if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_API_KEY) {
      return {
        success: true,
        url: `https://res.cloudinary.com/helensvale-connect/${folder}/mock_image_${Date.now()}.jpg`,
        public_id: `${folder}/mock_image_${Date.now()}`,
        secure_url: `https://res.cloudinary.com/helensvale-connect/${folder}/mock_image_${Date.now()}.jpg`
      };
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      secure_url: result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    // Mock implementation for development
    if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_API_KEY) {
      return {
        success: true,
        result: 'ok'
      };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: true,
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload multiple images
const uploadMultipleToCloudinary = async (files, folder = 'vendors') => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);
    
    return {
      success: failed.length === 0,
      successful,
      failed,
      total: files.length
    };
  } catch (error) {
    console.error('Multiple upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
  cloudinary
};
