const cloudinary = require('cloudinary').v2;

class CloudinaryService {
    constructor() {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    // Upload image buffer to Cloudinary
    async uploadImage(buffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: 'image',
                quality: 'auto:good',
                fetch_format: 'auto',
                ...options
            };

            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            uploadStream.end(buffer);
        });
    }

    // Delete image from Cloudinary
    async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw error;
        }
    }

    // Generate optimized image URL
    generateUrl(publicId, transformations = {}) {
        return cloudinary.url(publicId, {
            quality: 'auto:good',
            fetch_format: 'auto',
            ...transformations
        });
    }

    // Get image transformations for different use cases
    getTransformations() {
        return {
            logo: {
                width: 200,
                height: 200,
                crop: 'fit',
                background: 'transparent'
            },
            cover: {
                width: 1200,
                height: 600,
                crop: 'fill',
                gravity: 'center'
            },
            gallery: {
                width: 800,
                height: 600,
                crop: 'fill',
                gravity: 'center'
            },
            thumbnail: {
                width: 300,
                height: 200,
                crop: 'fill',
                gravity: 'center'
            },
            avatar: {
                width: 150,
                height: 150,
                crop: 'fill',
                gravity: 'face',
                radius: 'max'
            }
        };
    }
}

module.exports = new CloudinaryService();
