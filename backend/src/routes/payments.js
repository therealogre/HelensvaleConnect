const express = require('express');
const paynowService = require('../services/paynowService');
const EarlyAccessApplication = require('../models/EarlyAccessApplication');
const emailService = require('../services/emailService');

const router = express.Router();

// PayNow webhook for payment results
router.post('/paynow/result', async (req, res) => {
    try {
        console.log('PayNow result received:', req.body);
        
        const result = await paynowService.handlePaymentResult(req.body);
        
        if (result.valid && result.paid) {
            // Find application by payment reference
            const application = await EarlyAccessApplication.findOne({
                paymentReference: result.reference
            });
            
            if (application) {
                // Update payment status
                application.paymentStatus = 'completed';
                application.paidAt = new Date();
                
                // Auto-approve if eligible
                if (application.isEligibleForAutoApproval()) {
                    application.status = 'active';
                }
                
                await application.save();
                
                // Send store creation email
                try {
                    await emailService.sendStoreCreationInvite(application, result.reference);
                } catch (emailError) {
                    console.error('Store creation email failed:', emailError);
                }
                
                console.log(`Payment completed for application ${application._id}`);
            }
        }
        
        // Always respond with OK to PayNow
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('PayNow result handling error:', error);
        res.status(200).send('OK'); // Still respond OK to avoid retries
    }
});

// PayNow return URL handler
router.get('/paynow/return', async (req, res) => {
    try {
        const { reference } = req.query;
        
        if (reference) {
            const application = await EarlyAccessApplication.findOne({
                paymentReference: reference
            });
            
            if (application) {
                // Redirect to success page with application ID
                return res.redirect(`${process.env.FRONTEND_URL}/payment/success?app=${application._id}`);
            }
        }
        
        // Fallback redirect
        res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
        
    } catch (error) {
        console.error('PayNow return handling error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
    }
});

// Test PayNow configuration
router.get('/paynow/test', async (req, res) => {
    try {
        const testPayment = {
            reference: 'TEST-' + Date.now(),
            amount: 1.00,
            email: 'test@example.com',
            phone: '263771234567',
            description: 'Test Payment'
        };
        
        const result = await paynowService.createPayment(testPayment);
        
        res.json({
            success: true,
            message: 'PayNow configuration test',
            data: result
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'PayNow configuration error',
            error: error.message
        });
    }
});

module.exports = router;
