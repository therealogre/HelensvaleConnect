const EarlyAccessApplication = require('../models/EarlyAccessApplication');
const Store = require('../models/Store');
const emailService = require('../services/emailService');

class AdminController {
    // Get admin dashboard overview
    async getDashboard(req, res) {
        try {
            const [
                totalApplications,
                pendingApplications,
                approvedApplications,
                paidApplications,
                activeStores,
                recentApplications,
                businessTypeStats,
                revenueStats
            ] = await Promise.all([
                EarlyAccessApplication.countDocuments(),
                EarlyAccessApplication.countDocuments({ status: 'pending' }),
                EarlyAccessApplication.countDocuments({ status: 'approved' }),
                EarlyAccessApplication.countDocuments({ paymentStatus: 'completed' }),
                Store.countDocuments({ status: 'active' }),
                EarlyAccessApplication.find()
                    .sort({ appliedAt: -1 })
                    .limit(10)
                    .select('businessName ownerName email status appliedAt businessType selectedPlan'),
                EarlyAccessApplication.aggregate([
                    { $group: { _id: '$businessType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ]),
                EarlyAccessApplication.aggregate([
                    { $match: { paymentStatus: 'completed' } },
                    { $group: { 
                        _id: null, 
                        totalRevenue: { $sum: '$planPrice' },
                        avgPlanPrice: { $avg: '$planPrice' }
                    }}
                ])
            ]);

            const totalRevenue = revenueStats[0]?.totalRevenue || 0;
            const avgPlanPrice = revenueStats[0]?.avgPlanPrice || 0;

            // Calculate conversion rates
            const conversionRate = totalApplications > 0 ? 
                ((paidApplications / totalApplications) * 100).toFixed(1) : 0;

            res.json({
                success: true,
                data: {
                    overview: {
                        totalApplications,
                        pendingApplications,
                        approvedApplications,
                        paidApplications,
                        activeStores,
                        totalRevenue: totalRevenue.toFixed(2),
                        avgPlanPrice: avgPlanPrice.toFixed(2),
                        conversionRate: `${conversionRate}%`
                    },
                    recentApplications,
                    businessTypeStats,
                    charts: {
                        applicationsByStatus: [
                            { name: 'Pending', value: pendingApplications, color: '#f59e0b' },
                            { name: 'Approved', value: approvedApplications, color: '#10b981' },
                            { name: 'Paid', value: paidApplications, color: '#6366f1' }
                        ],
                        businessTypes: businessTypeStats.map(stat => ({
                            name: this.formatBusinessType(stat._id),
                            value: stat.count,
                            color: this.getBusinessTypeColor(stat._id)
                        }))
                    }
                }
            });

        } catch (error) {
            console.error('Get admin dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard data'
            });
        }
    }

    // Get applications with advanced filtering
    async getApplications(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                businessType,
                paymentStatus,
                search,
                sortBy = 'appliedAt',
                sortOrder = 'desc'
            } = req.query;

            // Build filter
            const filter = {};
            if (status) filter.status = status;
            if (businessType) filter.businessType = businessType;
            if (paymentStatus) filter.paymentStatus = paymentStatus;
            if (search) {
                filter.$or = [
                    { businessName: { $regex: search, $options: 'i' } },
                    { ownerName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const applications = await EarlyAccessApplication.find(filter)
                .sort(sort)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const total = await EarlyAccessApplication.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    applications,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total,
                        limit: parseInt(limit)
                    },
                    filters: {
                        status,
                        businessType,
                        paymentStatus,
                        search
                    }
                }
            });

        } catch (error) {
            console.error('Get applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get applications'
            });
        }
    }

    // Bulk approve applications
    async bulkApproveApplications(req, res) {
        try {
            const { applicationIds, adminNotes } = req.body;

            if (!applicationIds || !Array.isArray(applicationIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Application IDs array is required'
                });
            }

            const applications = await EarlyAccessApplication.find({
                _id: { $in: applicationIds },
                status: 'pending'
            });

            const results = [];

            for (const application of applications) {
                try {
                    application.status = 'approved';
                    application.approvedAt = new Date();
                    if (adminNotes) application.adminNotes = adminNotes;
                    await application.save();

                    // Send approval email
                    await emailService.sendApplicationApprovedEmail(application);

                    // Update MailerLite
                    if (application.mailerliteSubscriberId) {
                        await emailService.updateSubscriber(application.mailerliteSubscriberId, {
                            fields: { application_status: 'approved' }
                        });
                    }

                    results.push({
                        applicationId: application._id,
                        businessName: application.businessName,
                        status: 'success'
                    });

                } catch (error) {
                    console.error(`Failed to approve application ${application._id}:`, error);
                    results.push({
                        applicationId: application._id,
                        businessName: application.businessName,
                        status: 'error',
                        error: error.message
                    });
                }
            }

            res.json({
                success: true,
                message: `Processed ${results.length} applications`,
                data: { results }
            });

        } catch (error) {
            console.error('Bulk approve applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to bulk approve applications'
            });
        }
    }

    // Send payment reminders
    async sendPaymentReminders(req, res) {
        try {
            const { applicationIds } = req.body;

            const applications = await EarlyAccessApplication.find({
                _id: { $in: applicationIds },
                status: 'approved',
                paymentStatus: 'pending'
            });

            const results = [];

            for (const application of applications) {
                try {
                    await emailService.sendPaymentReminderEmail(application);
                    
                    results.push({
                        applicationId: application._id,
                        businessName: application.businessName,
                        email: application.email,
                        status: 'sent'
                    });

                } catch (error) {
                    console.error(`Failed to send reminder to ${application._id}:`, error);
                    results.push({
                        applicationId: application._id,
                        businessName: application.businessName,
                        email: application.email,
                        status: 'error',
                        error: error.message
                    });
                }
            }

            res.json({
                success: true,
                message: `Sent ${results.filter(r => r.status === 'sent').length} payment reminders`,
                data: { results }
            });

        } catch (error) {
            console.error('Send payment reminders error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send payment reminders'
            });
        }
    }

    // Get stores management
    async getStores(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                businessType,
                isLaunched,
                search,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            // Build filter
            const filter = {};
            if (status) filter.status = status;
            if (businessType) filter.businessType = businessType;
            if (isLaunched !== undefined) filter.isLaunched = isLaunched === 'true';
            if (search) {
                filter.$or = [
                    { storeName: { $regex: search, $options: 'i' } },
                    { ownerName: { $regex: search, $options: 'i' } },
                    { contactEmail: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const stores = await Store.find(filter)
                .sort(sort)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('ownerId', 'businessName ownerName email selectedPlan')
                .exec();

            const total = await Store.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    stores,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Get stores error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get stores'
            });
        }
    }

    // Update store showcase order
    async updateStoreShowcaseOrder(req, res) {
        try {
            const { storeOrders } = req.body; // Array of { storeId, order }

            const updatePromises = storeOrders.map(({ storeId, order }) =>
                Store.findByIdAndUpdate(storeId, { showcaseOrder: order })
            );

            await Promise.all(updatePromises);

            res.json({
                success: true,
                message: 'Store showcase order updated successfully'
            });

        } catch (error) {
            console.error('Update store showcase order error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update store showcase order'
            });
        }
    }

    // Toggle store featured status
    async toggleStoreFeatured(req, res) {
        try {
            const { storeId } = req.params;
            const { featured } = req.body;

            const store = await Store.findByIdAndUpdate(
                storeId,
                { isFeatured: featured },
                { new: true }
            );

            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }

            res.json({
                success: true,
                message: `Store ${featured ? 'featured' : 'unfeatured'} successfully`,
                data: { store }
            });

        } catch (error) {
            console.error('Toggle store featured error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update store featured status'
            });
        }
    }

    // Helper methods
    formatBusinessType(type) {
        const mapping = {
            'restaurant': 'Restaurant',
            'salon_spa': 'Salon & Spa',
            'automotive': 'Automotive',
            'home_services': 'Home Services',
            'healthcare': 'Healthcare',
            'fitness': 'Fitness',
            'retail': 'Retail',
            'professional_services': 'Professional Services',
            'education': 'Education',
            'entertainment': 'Entertainment',
            'other': 'Other'
        };
        return mapping[type] || type;
    }

    getBusinessTypeColor(type) {
        const colors = {
            'restaurant': '#dc2626',
            'salon_spa': '#ec4899',
            'automotive': '#1f2937',
            'home_services': '#059669',
            'healthcare': '#0284c7',
            'fitness': '#7c3aed',
            'retail': '#059669',
            'professional_services': '#6366f1',
            'education': '#0891b2',
            'entertainment': '#c2410c',
            'other': '#6b7280'
        };
        return colors[type] || '#6b7280';
    }
}

module.exports = new AdminController();
