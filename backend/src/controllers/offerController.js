const { validationResult } = require('express-validator');

class OfferController {
    // Get all offers for the current user's store
    async getOffers(req, res) {
        try {
            const userId = req.user.id;
            
            // Mock data for now - will be replaced with actual database queries
            const offers = [
                {
                    id: '1',
                    title: 'New Customer Special',
                    description: '20% off first service for new customers',
                    discountType: 'percentage',
                    discountValue: 20,
                    minPurchase: 50,
                    maxDiscount: 100,
                    validFrom: new Date('2024-01-01'),
                    validUntil: new Date('2024-03-31'),
                    usageLimit: 100,
                    usedCount: 23,
                    status: 'active',
                    applicableServices: ['all'],
                    terms: 'Valid for first-time customers only. Cannot be combined with other offers.',
                    createdAt: new Date('2024-01-01')
                },
                {
                    id: '2',
                    title: 'Weekend Warriors',
                    description: 'Buy 2 services, get 1 free on weekends',
                    discountType: 'buy_x_get_y',
                    buyQuantity: 2,
                    getQuantity: 1,
                    validFrom: new Date('2024-02-01'),
                    validUntil: new Date('2024-04-30'),
                    usageLimit: 50,
                    usedCount: 8,
                    status: 'active',
                    applicableServices: ['haircut', 'styling'],
                    terms: 'Valid on Saturdays and Sundays only. Lowest priced service is free.',
                    createdAt: new Date('2024-02-01')
                }
            ];

            res.json({
                success: true,
                data: {
                    offers,
                    totalOffers: offers.length,
                    activeOffers: offers.filter(o => o.status === 'active').length,
                    totalRedemptions: offers.reduce((sum, o) => sum + o.usedCount, 0)
                }
            });

        } catch (error) {
            console.error('Get offers error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get offers'
            });
        }
    }

    // Create a new offer
    async createOffer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const userId = req.user.id;
            const {
                title,
                description,
                discountType,
                discountValue,
                buyQuantity,
                getQuantity,
                minPurchase,
                maxDiscount,
                validFrom,
                validUntil,
                usageLimit,
                applicableServices,
                terms
            } = req.body;

            // Generate unique offer code
            const offerCode = this.generateOfferCode(title);

            // Mock offer creation - will be replaced with actual database save
            const newOffer = {
                id: Date.now().toString(),
                title,
                description,
                offerCode,
                discountType,
                discountValue: discountType === 'percentage' || discountType === 'fixed' ? parseFloat(discountValue) : null,
                buyQuantity: discountType === 'buy_x_get_y' ? parseInt(buyQuantity) : null,
                getQuantity: discountType === 'buy_x_get_y' ? parseInt(getQuantity) : null,
                minPurchase: parseFloat(minPurchase) || 0,
                maxDiscount: parseFloat(maxDiscount) || null,
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                usageLimit: parseInt(usageLimit) || null,
                usedCount: 0,
                status: 'active',
                applicableServices: applicableServices || ['all'],
                terms: terms || '',
                createdAt: new Date(),
                ownerId: userId
            };

            res.status(201).json({
                success: true,
                message: 'Offer created successfully',
                data: { offer: newOffer }
            });

        } catch (error) {
            console.error('Create offer error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create offer'
            });
        }
    }

    // Update offer
    async updateOffer(req, res) {
        try {
            const { offerId } = req.params;
            const updates = req.body;

            // Mock update - will be replaced with actual database update
            res.json({
                success: true,
                message: 'Offer updated successfully',
                data: {
                    offerId,
                    updates
                }
            });

        } catch (error) {
            console.error('Update offer error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update offer'
            });
        }
    }

    // Delete offer
    async deleteOffer(req, res) {
        try {
            const { offerId } = req.params;

            // Mock deletion - will be replaced with actual database deletion
            res.json({
                success: true,
                message: 'Offer deleted successfully'
            });

        } catch (error) {
            console.error('Delete offer error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete offer'
            });
        }
    }

    // Toggle offer status
    async toggleOfferStatus(req, res) {
        try {
            const { offerId } = req.params;
            const { status } = req.body;

            // Mock status toggle - will be replaced with actual database update
            res.json({
                success: true,
                message: `Offer ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
                data: {
                    offerId,
                    newStatus: status
                }
            });

        } catch (error) {
            console.error('Toggle offer status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update offer status'
            });
        }
    }

    // Get offer analytics
    async getOfferAnalytics(req, res) {
        try {
            const { offerId } = req.params;

            // Mock analytics data
            const analytics = {
                offerId,
                performance: {
                    totalViews: 1250,
                    totalRedemptions: 23,
                    conversionRate: 1.84,
                    totalSavings: 460,
                    averageOrderValue: 85,
                    revenueGenerated: 1955
                },
                timeline: [
                    { date: '2024-01-01', views: 45, redemptions: 2, revenue: 90 },
                    { date: '2024-01-02', views: 62, redemptions: 3, revenue: 135 },
                    { date: '2024-01-03', views: 38, redemptions: 1, revenue: 45 }
                ],
                topServices: [
                    { service: 'Haircut & Style', redemptions: 12, revenue: 540 },
                    { service: 'Manicure', redemptions: 8, revenue: 320 },
                    { service: 'Facial Treatment', redemptions: 3, revenue: 225 }
                ]
            };

            res.json({
                success: true,
                data: { analytics }
            });

        } catch (error) {
            console.error('Get offer analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get offer analytics'
            });
        }
    }

    // Helper method to generate offer codes
    generateOfferCode(title) {
        const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${cleanTitle.substring(0, 6)}${randomSuffix}`;
    }
}

module.exports = new OfferController();
