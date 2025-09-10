const EarlyAccessApplication = require('../models/EarlyAccessApplication');
const Store = require('../models/Store');
const emailService = require('../services/emailService');
const paynowService = require('../services/paynowService');
const { validationResult } = require('express-validator');

class EarlyAccessController {
    // Submit early access application
    async submitApplication(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const {
                businessName,
                ownerName,
                email,
                phone,
                businessType,
                businessDescription,
                city,
                selectedPlan
            } = req.body;

            // Check if application already exists
            const existingApplication = await EarlyAccessApplication.findOne({ email });
            if (existingApplication) {
                return res.status(409).json({
                    success: false,
                    message: 'Application already exists for this email address'
                });
            }

            // Calculate plan price
            const planPrice = paynowService.calculatePaymentAmount(selectedPlan);

            // Create application
            const application = new EarlyAccessApplication({
                businessName,
                ownerName,
                email,
                phone,
                businessType,
                businessDescription,
                city,
                selectedPlan,
                planPrice,
                status: 'pending'
            });

            await application.save();

            // Add to MailerLite early access group
            try {
                const subscriber = await emailService.addSubscriber(
                    email,
                    ownerName,
                    emailService.groups.EARLY_ACCESS,
                    {
                        businessName,
                        businessType,
                        phone,
                        city,
                        selectedPlan,
                        status: 'pending'
                    }
                );
                application.mailerliteSubscriberId = subscriber.id;
                await application.save();
            } catch (emailError) {
                console.error('MailerLite subscription failed:', emailError);
                // Continue without failing the application
            }

            // Send application received email
            try {
                await emailService.sendApplicationReceivedEmail(application);
            } catch (emailError) {
                console.error('Application received email failed:', emailError);
            }

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: {
                    applicationId: application._id,
                    status: application.status,
                    businessName: application.businessName
                }
            });

        } catch (error) {
            console.error('Application submission error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit application',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get application status
    async getApplicationStatus(req, res) {
        try {
            const { applicationId } = req.params;
            
            const application = await EarlyAccessApplication.findById(applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            res.json({
                success: true,
                data: {
                    applicationId: application._id,
                    businessName: application.businessName,
                    status: application.status,
                    paymentStatus: application.paymentStatus,
                    selectedPlan: application.selectedPlan,
                    planPrice: application.planPrice,
                    appliedAt: application.appliedAt,
                    approvedAt: application.approvedAt
                }
            });

        } catch (error) {
            console.error('Get application status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get application status'
            });
        }
    }

    // Admin: Get all applications
    async getAllApplications(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                businessType,
                sortBy = 'appliedAt',
                sortOrder = 'desc'
            } = req.query;

            const filter = {};
            if (status) filter.status = status;
            if (businessType) filter.businessType = businessType;

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
                        current: page,
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });

        } catch (error) {
            console.error('Get all applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get applications'
            });
        }
    }

    // Admin: Approve application
    async approveApplication(req, res) {
        try {
            const { applicationId } = req.params;
            const { adminNotes } = req.body;

            const application = await EarlyAccessApplication.findById(applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            if (application.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Application is not in pending status'
                });
            }

            // Update application status
            application.status = 'approved';
            application.approvedAt = new Date();
            if (adminNotes) application.adminNotes = adminNotes;
            await application.save();

            // Update MailerLite subscriber
            try {
                if (application.mailerliteSubscriberId) {
                    await emailService.updateSubscriber(application.mailerliteSubscriberId, {
                        fields: { application_status: 'approved' }
                    });
                }
                
                // Move to approved group
                await emailService.addSubscriber(
                    application.email,
                    application.ownerName,
                    emailService.groups.APPROVED_BUSINESSES,
                    {
                        businessName: application.businessName,
                        businessType: application.businessType,
                        selectedPlan: application.selectedPlan,
                        status: 'approved'
                    }
                );
            } catch (emailError) {
                console.error('MailerLite update failed:', emailError);
            }

            // Send approval email
            try {
                await emailService.sendApplicationApprovedEmail(application);
            } catch (emailError) {
                console.error('Approval email failed:', emailError);
            }

            res.json({
                success: true,
                message: 'Application approved successfully',
                data: {
                    applicationId: application._id,
                    status: application.status
                }
            });

        } catch (error) {
            console.error('Approve application error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve application'
            });
        }
    }

    // Admin: Reject application
    async rejectApplication(req, res) {
        try {
            const { applicationId } = req.params;
            const { adminNotes } = req.body;

            const application = await EarlyAccessApplication.findById(applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            application.status = 'rejected';
            if (adminNotes) application.adminNotes = adminNotes;
            await application.save();

            // Update MailerLite subscriber
            try {
                if (application.mailerliteSubscriberId) {
                    await emailService.updateSubscriber(application.mailerliteSubscriberId, {
                        fields: { application_status: 'rejected' }
                    });
                }
            } catch (emailError) {
                console.error('MailerLite update failed:', emailError);
            }

            res.json({
                success: true,
                message: 'Application rejected',
                data: {
                    applicationId: application._id,
                    status: application.status
                }
            });

        } catch (error) {
            console.error('Reject application error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reject application'
            });
        }
    }

    // Create payment for approved application
    async createPayment(req, res) {
        try {
            const { applicationId } = req.params;

            const application = await EarlyAccessApplication.findById(applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            if (application.status !== 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Application must be approved before payment'
                });
            }

            if (application.paymentStatus === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already completed'
                });
            }

            // Create Paynow payment
            const paymentResult = await paynowService.createSubscriptionPayment(application);

            if (paymentResult.success) {
                // Update application with payment details
                application.paymentReference = paymentResult.reference;
                application.paynowPollUrl = paymentResult.pollUrl;
                application.status = 'payment_pending';
                await application.save();

                // Move to pending payment group in MailerLite
                try {
                    await emailService.addSubscriber(
                        application.email,
                        application.ownerName,
                        emailService.groups.PENDING_PAYMENT,
                        {
                            businessName: application.businessName,
                            paymentReference: paymentResult.reference,
                            status: 'payment_pending'
                        }
                    );
                } catch (emailError) {
                    console.error('MailerLite payment group failed:', emailError);
                }

                res.json({
                    success: true,
                    message: 'Payment created successfully',
                    data: {
                        redirectUrl: paymentResult.redirectUrl,
                        reference: paymentResult.reference,
                        pollUrl: paymentResult.pollUrl
                    }
                });
            } else {
                throw new Error('Payment creation failed');
            }

        } catch (error) {
            console.error('Create payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create payment',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Check payment status
    async checkPaymentStatus(req, res) {
        try {
            const { applicationId } = req.params;

            const application = await EarlyAccessApplication.findById(applicationId);
            if (!application || !application.paynowPollUrl) {
                return res.status(404).json({
                    success: false,
                    message: 'Application or payment not found'
                });
            }

            const paymentStatus = await paynowService.pollPaymentStatus(application.paynowPollUrl);

            // Update application if payment is completed
            if (paymentStatus.paid && application.paymentStatus !== 'completed') {
                application.paymentStatus = 'completed';
                application.paidAt = new Date();
                
                // Auto-approve if eligible
                if (application.isEligibleForAutoApproval()) {
                    application.status = 'active';
                }
                
                await application.save();

                // Send store creation email
                try {
                    await emailService.sendStoreCreationInvite(application, application.paymentReference);
                } catch (emailError) {
                    console.error('Store creation email failed:', emailError);
                }
            }

            res.json({
                success: true,
                data: {
                    paid: paymentStatus.paid,
                    status: paymentStatus.status,
                    applicationStatus: application.status,
                    paymentStatus: application.paymentStatus
                }
            });

        } catch (error) {
            console.error('Check payment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check payment status'
            });
        }
    }

    // Get dashboard statistics
    async getDashboardStats(req, res) {
        try {
            const stats = await Promise.all([
                EarlyAccessApplication.countDocuments({ status: 'pending' }),
                EarlyAccessApplication.countDocuments({ status: 'approved' }),
                EarlyAccessApplication.countDocuments({ paymentStatus: 'completed' }),
                EarlyAccessApplication.countDocuments({ storeCreated: true }),
                EarlyAccessApplication.aggregate([
                    { $match: { paymentStatus: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$planPrice' } } }
                ])
            ]);

            const totalRevenue = stats[4][0]?.total || 0;

            // Get applications by business type
            const businessTypeStats = await EarlyAccessApplication.aggregate([
                { $group: { _id: '$businessType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            // Get recent applications
            const recentApplications = await EarlyAccessApplication.find()
                .sort({ appliedAt: -1 })
                .limit(10)
                .select('businessName ownerName status appliedAt businessType');

            res.json({
                success: true,
                data: {
                    pending: stats[0],
                    approved: stats[1],
                    paid: stats[2],
                    storesCreated: stats[3],
                    totalRevenue,
                    businessTypeStats,
                    recentApplications
                }
            });

        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard statistics'
            });
        }
    }
}

module.exports = new EarlyAccessController();
