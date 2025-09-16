const Store = require('../models/Store');
const EarlyAccessApplication = require('../models/EarlyAccessApplication');
const cloudinary = require('../services/cloudinaryService');
const { validationResult } = require('express-validator');

class StoreController {
    // Get store creation form for approved application
    async getStoreCreationForm(req, res) {
        try {
            const { applicationId } = req.params;
            const { ref } = req.query; // payment reference

            const application = await EarlyAccessApplication.findById(applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            if (application.paymentStatus !== 'completed') {
                return res.status(403).json({
                    success: false,
                    message: 'Payment must be completed before store creation'
                });
            }

            // Get template configuration based on business type
            const templateConfig = this.getBusinessTypeTemplate(application.businessType);

            res.json({
                success: true,
                data: {
                    application: {
                        id: application._id,
                        businessName: application.businessName,
                        businessType: application.businessType,
                        ownerName: application.ownerName,
                        email: application.email,
                        phone: application.phone,
                        city: application.city
                    },
                    templateConfig,
                    paymentReference: ref
                }
            });

        } catch (error) {
            console.error('Get store creation form error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get store creation form'
            });
        }
    }

    // Create new store
    async createStore(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { applicationId } = req.params;
            const storeData = req.body;

            const application = await EarlyAccessApplication.findById(applicationId);
            if (!application || application.paymentStatus !== 'completed') {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid application or payment not completed'
                });
            }

            if (application.storeCreated) {
                return res.status(409).json({
                    success: false,
                    message: 'Store already created for this application'
                });
            }

            // Generate unique store slug
            const baseSlug = storeData.storeName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            
            const storeSlug = `${baseSlug}-${application._id.toString().slice(-6)}`;

            // Create store
            const store = new Store({
                storeName: storeData.storeName,
                storeSlug,
                description: storeData.description,
                tagline: storeData.tagline,
                ownerId: application._id,
                ownerName: application.ownerName,
                contactEmail: application.email,
                contactPhone: application.phone,
                businessType: application.businessType,
                category: storeData.category,
                subcategory: storeData.subcategory,
                address: {
                    street: storeData.address?.street,
                    city: application.city,
                    province: storeData.address?.province,
                    country: 'Zimbabwe',
                    postalCode: storeData.address?.postalCode
                },
                coordinates: storeData.coordinates,
                serviceArea: storeData.serviceArea,
                brandColors: storeData.brandColors || this.getDefaultBrandColors(application.businessType),
                theme: storeData.theme || 'modern',
                services: storeData.services || [],
                operatingHours: storeData.operatingHours || this.getDefaultOperatingHours(),
                features: storeData.features || {},
                policies: storeData.policies || {},
                paymentMethods: storeData.paymentMethods || { cash: true, ecocash: false },
                socialMedia: storeData.socialMedia || {},
                template: this.getTemplateForBusinessType(application.businessType),
                customDesignRequested: storeData.customDesignRequested || false,
                designNotes: storeData.designNotes,
                status: 'active',
                showcaseOnHomepage: true,
                showcaseOrder: await this.getNextShowcaseOrder()
            });

            await store.save();

            // Update application
            application.storeCreated = true;
            application.storeId = store._id;
            await application.save();

            res.status(201).json({
                success: true,
                message: 'Store created successfully',
                data: {
                    storeId: store._id,
                    storeSlug: store.storeSlug,
                    storeUrl: store.storeUrl,
                    status: store.status
                }
            });

        } catch (error) {
            console.error('Create store error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create store',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Upload store images
    async uploadStoreImages(req, res) {
        try {
            const { storeId } = req.params;
            const { imageType } = req.body; // 'logo', 'cover', 'gallery'

            const store = await Store.findById(storeId);
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No images uploaded'
                });
            }

            const uploadPromises = req.files.map(file => 
                cloudinary.uploadImage(file.buffer, {
                    folder: `helensvale-connect/stores/${storeId}`,
                    transformation: this.getImageTransformation(imageType)
                })
            );

            const uploadResults = await Promise.all(uploadPromises);

            // Update store with image URLs
            if (imageType === 'logo' && uploadResults[0]) {
                store.logo = {
                    url: uploadResults[0].secure_url,
                    publicId: uploadResults[0].public_id
                };
            } else if (imageType === 'cover' && uploadResults[0]) {
                store.coverImage = {
                    url: uploadResults[0].secure_url,
                    publicId: uploadResults[0].public_id
                };
            } else if (imageType === 'gallery') {
                const galleryImages = uploadResults.map((result, index) => ({
                    url: result.secure_url,
                    publicId: result.public_id,
                    caption: req.body.captions?.[index] || '',
                    order: store.gallery.length + index
                }));
                store.gallery.push(...galleryImages);
            }

            await store.save();

            res.json({
                success: true,
                message: 'Images uploaded successfully',
                data: {
                    images: uploadResults.map(result => ({
                        url: result.secure_url,
                        publicId: result.public_id
                    }))
                }
            });

        } catch (error) {
            console.error('Upload store images error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload images'
            });
        }
    }

    // Get store by slug
    async getStoreBySlug(req, res) {
        try {
            const { slug } = req.params;

            const store = await Store.findOne({ storeSlug: slug, status: 'active' });
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            // Increment view count
            store.metrics.totalViews += 1;
            await store.save();

            res.json({
                success: true,
                data: { store }
            });

        } catch (error) {
            console.error('Get store by slug error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get store'
            });
        }
    }

    // Get stores for homepage showcase
    async getHomepageStores(req, res) {
        try {
            const { limit = 12 } = req.query;

            const stores = await Store.find({
                status: 'active',
                isLaunched: true,
                showcaseOnHomepage: true
            })
            .sort({ showcaseOrder: 1, createdAt: -1 })
            .limit(parseInt(limit))
            .select('storeName storeSlug description businessType logo coverImage metrics address.city');

            res.json({
                success: true,
                data: { stores }
            });

        } catch (error) {
            console.error('Get homepage stores error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get homepage stores'
            });
        }
    }

    // Launch store (make it live)
    async launchStore(req, res) {
        try {
            const { storeId } = req.params;

            const store = await Store.findById(storeId);
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            store.isLaunched = true;
            store.launchedAt = new Date();
            await store.save();

            res.json({
                success: true,
                message: 'Store launched successfully',
                data: {
                    storeId: store._id,
                    storeUrl: store.storeUrl,
                    launchedAt: store.launchedAt
                }
            });

        } catch (error) {
            console.error('Launch store error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to launch store'
            });
        }
    }

    // Request custom design
    async requestCustomDesign(req, res) {
        try {
            const { storeId } = req.params;
            const { designNotes, contactPreference } = req.body;

            const store = await Store.findById(storeId);
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            store.customDesignRequested = true;
            store.designNotes = designNotes;
            await store.save();

            // TODO: Send notification to admin/design team
            // TODO: Create design request ticket

            res.json({
                success: true,
                message: 'Custom design request submitted successfully',
                data: {
                    estimatedCost: 49, // Discounted from $199
                    estimatedDelivery: '3-5 business days',
                    nextSteps: 'Our design team will contact you within 24 hours to discuss your requirements.'
                }
            });

        } catch (error) {
            console.error('Request custom design error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit custom design request'
            });
        }
    }

    // Get user's store data for dashboard
    async getMyStore(req, res) {
        try {
            const userId = req.user.id;
            
            // Find store owned by the current user
            const store = await Store.findOne({ 
                $or: [
                    { ownerId: userId },
                    { 'team.userId': userId }
                ]
            });

            if (!store) {
                return res.json({
                    success: true,
                    data: {
                        hasStore: false,
                        message: 'No store found. Create your first store to get started.'
                    }
                });
            }

            // Calculate store metrics
            const metrics = {
                totalViews: store.metrics.totalViews || 0,
                totalBookings: store.metrics.totalBookings || 0,
                totalRevenue: store.metrics.totalRevenue || 0,
                averageRating: store.metrics.averageRating || 0,
                activeServices: store.services?.length || 0,
                completionRate: this.calculateStoreCompletion(store)
            };

            res.json({
                success: true,
                data: {
                    hasStore: true,
                    store: {
                        id: store._id,
                        storeName: store.storeName,
                        storeSlug: store.storeSlug,
                        description: store.description,
                        businessType: store.businessType,
                        category: store.category,
                        status: store.status,
                        isLaunched: store.isLaunched,
                        logo: store.logo,
                        coverImage: store.coverImage,
                        services: store.services,
                        operatingHours: store.operatingHours,
                        address: store.address,
                        paymentMethods: store.paymentMethods,
                        socialMedia: store.socialMedia,
                        createdAt: store.createdAt,
                        launchedAt: store.launchedAt
                    },
                    metrics
                }
            });

        } catch (error) {
            console.error('Get my store error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get store data'
            });
        }
    }

    // Calculate store profile completion percentage
    calculateStoreCompletion(store) {
        const requiredFields = [
            'storeName', 'description', 'businessType', 'category',
            'address.street', 'address.city', 'operatingHours'
        ];
        
        const optionalFields = [
            'logo.url', 'coverImage.url', 'services', 'socialMedia.facebook',
            'paymentMethods.ecocash', 'tagline'
        ];

        let completed = 0;
        let total = requiredFields.length + optionalFields.length;

        // Check required fields
        requiredFields.forEach(field => {
            if (this.getNestedValue(store, field)) completed++;
        });

        // Check optional fields
        optionalFields.forEach(field => {
            if (this.getNestedValue(store, field)) completed++;
        });

        return Math.round((completed / total) * 100);
    }

    // Helper to get nested object values
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // Helper methods
    getBusinessTypeTemplate(businessType) {
        const templates = {
            restaurant: {
                name: 'Restaurant & Food',
                primaryColor: '#dc2626',
                sections: ['hero', 'menu', 'about', 'gallery', 'reviews', 'contact'],
                features: ['onlineBooking', 'delivery'],
                sampleServices: [
                    { name: 'Dine-in Service', category: 'dining' },
                    { name: 'Takeaway Orders', category: 'takeaway' },
                    { name: 'Catering Services', category: 'catering' }
                ]
            },
            salon_spa: {
                name: 'Salon & Spa',
                primaryColor: '#ec4899',
                sections: ['hero', 'services', 'gallery', 'team', 'reviews', 'booking'],
                features: ['onlineBooking'],
                sampleServices: [
                    { name: 'Haircut & Styling', category: 'hair', duration: 60 },
                    { name: 'Manicure & Pedicure', category: 'nails', duration: 90 },
                    { name: 'Facial Treatment', category: 'skincare', duration: 75 }
                ]
            },
            automotive: {
                name: 'Automotive Services',
                primaryColor: '#1f2937',
                sections: ['hero', 'services', 'about', 'gallery', 'contact'],
                features: ['onlineBooking', 'homeService'],
                sampleServices: [
                    { name: 'Car Service & Repair', category: 'maintenance' },
                    { name: 'Tire Installation', category: 'tires' },
                    { name: 'Mobile Mechanic', category: 'mobile' }
                ]
            },
            home_services: {
                name: 'Home Services',
                primaryColor: '#059669',
                sections: ['hero', 'services', 'about', 'testimonials', 'contact'],
                features: ['onlineBooking', 'homeService'],
                sampleServices: [
                    { name: 'Plumbing Services', category: 'plumbing' },
                    { name: 'Electrical Work', category: 'electrical' },
                    { name: 'Cleaning Services', category: 'cleaning' }
                ]
            },
            healthcare: {
                name: 'Healthcare',
                primaryColor: '#0284c7',
                sections: ['hero', 'services', 'team', 'about', 'contact'],
                features: ['onlineBooking'],
                sampleServices: [
                    { name: 'General Consultation', category: 'consultation', duration: 30 },
                    { name: 'Health Checkup', category: 'checkup', duration: 45 },
                    { name: 'Specialist Consultation', category: 'specialist', duration: 60 }
                ]
            },
            fitness: {
                name: 'Fitness & Wellness',
                primaryColor: '#7c3aed',
                sections: ['hero', 'programs', 'trainers', 'gallery', 'contact'],
                features: ['onlineBooking'],
                sampleServices: [
                    { name: 'Personal Training', category: 'training', duration: 60 },
                    { name: 'Group Classes', category: 'classes', duration: 45 },
                    { name: 'Nutrition Consultation', category: 'nutrition', duration: 30 }
                ]
            },
            retail: {
                name: 'Retail Store',
                primaryColor: '#059669',
                sections: ['hero', 'products', 'about', 'gallery', 'contact'],
                features: ['delivery', 'pickupAvailable'],
                sampleServices: [
                    { name: 'Product Sales', category: 'sales' },
                    { name: 'Home Delivery', category: 'delivery' },
                    { name: 'Click & Collect', category: 'pickup' }
                ]
            }
        };

        return templates[businessType] || templates.home_services;
    }

    getDefaultBrandColors(businessType) {
        const template = this.getBusinessTypeTemplate(businessType);
        return {
            primary: template.primaryColor,
            secondary: '#8b5cf6',
            accent: '#06b6d4'
        };
    }

    getDefaultOperatingHours() {
        return {
            monday: { open: '08:00', close: '17:00', closed: false },
            tuesday: { open: '08:00', close: '17:00', closed: false },
            wednesday: { open: '08:00', close: '17:00', closed: false },
            thursday: { open: '08:00', close: '17:00', closed: false },
            friday: { open: '08:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '15:00', closed: false },
            sunday: { open: '10:00', close: '14:00', closed: true }
        };
    }

    getTemplateForBusinessType(businessType) {
        const mapping = {
            restaurant: 'restaurant',
            salon_spa: 'salon',
            automotive: 'automotive',
            home_services: 'services',
            healthcare: 'healthcare',
            fitness: 'services',
            retail: 'retail',
            professional_services: 'services',
            education: 'services',
            entertainment: 'services'
        };

        return mapping[businessType] || 'services';
    }

    getImageTransformation(imageType) {
        const transformations = {
            logo: { width: 200, height: 200, crop: 'fit', quality: 'auto' },
            cover: { width: 1200, height: 600, crop: 'fill', quality: 'auto' },
            gallery: { width: 800, height: 600, crop: 'fill', quality: 'auto' }
        };

        return transformations[imageType] || transformations.gallery;
    }

    async getNextShowcaseOrder() {
        const lastStore = await Store.findOne({ showcaseOnHomepage: true })
            .sort({ showcaseOrder: -1 })
            .select('showcaseOrder');
        
        return (lastStore?.showcaseOrder || 0) + 1;
    }
}

module.exports = new StoreController();
