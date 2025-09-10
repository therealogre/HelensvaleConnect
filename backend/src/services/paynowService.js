const axios = require('axios');
const crypto = require('crypto');

class PaynowService {
    constructor() {
        this.integrationId = process.env.PAYNOW_INTEGRATION_ID;
        this.integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
        this.baseUrl = 'https://www.paynow.co.zw/interface/initiatetransaction';
        this.pollUrl = 'https://www.paynow.co.zw/interface/pollurl';
        this.resultUrl = process.env.PAYNOW_RESULT_URL || `${process.env.BACKEND_URL}/api/payments/paynow/result`;
        this.returnUrl = process.env.PAYNOW_RETURN_URL || `${process.env.FRONTEND_URL}/payment/success`;
    }

    // Generate hash for Paynow authentication
    generateHash(fields, integrationKey) {
        const sortedFields = Object.keys(fields)
            .sort()
            .map(key => `${key}=${fields[key]}`)
            .join('&');
        
        const hashString = sortedFields + integrationKey;
        return crypto.createHash('sha512').update(hashString).digest('hex').toUpperCase();
    }

    // Create payment request
    async createPayment(paymentData) {
        try {
            const {
                reference,
                amount,
                email,
                phone,
                description = 'Helensvale Connect Subscription'
            } = paymentData;

            // Prepare payment fields
            const fields = {
                id: this.integrationId,
                reference: reference,
                amount: amount.toFixed(2),
                additionalinfo: description,
                returnurl: this.returnUrl,
                resulturl: this.resultUrl,
                authemail: email,
                phone: phone,
                status: 'Message'
            };

            // Generate hash
            const hash = this.generateHash(fields, this.integrationKey);
            fields.hash = hash;

            // Make request to Paynow
            const response = await axios.post(this.baseUrl, new URLSearchParams(fields), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            // Parse response
            const responseData = this.parsePaynowResponse(response.data);

            if (responseData.status === 'Ok') {
                return {
                    success: true,
                    pollUrl: responseData.pollurl,
                    redirectUrl: responseData.browserurl,
                    hash: responseData.hash,
                    reference: reference
                };
            } else {
                throw new Error(responseData.error || 'Payment initialization failed');
            }

        } catch (error) {
            console.error('Paynow payment creation error:', error);
            throw new Error(`Payment creation failed: ${error.message}`);
        }
    }

    // Poll payment status
    async pollPaymentStatus(pollUrl) {
        try {
            const response = await axios.post(pollUrl);
            const responseData = this.parsePaynowResponse(response.data);

            return {
                status: responseData.status,
                paid: responseData.paid === 'Yes',
                amount: parseFloat(responseData.amount || 0),
                reference: responseData.reference,
                paynowreference: responseData.paynowreference,
                pollurl: responseData.pollurl,
                hash: responseData.hash
            };

        } catch (error) {
            console.error('Paynow polling error:', error);
            throw new Error(`Payment status check failed: ${error.message}`);
        }
    }

    // Verify payment hash
    verifyHash(responseData, integrationKey) {
        const receivedHash = responseData.hash;
        delete responseData.hash;

        const calculatedHash = this.generateHash(responseData, integrationKey);
        return receivedHash === calculatedHash;
    }

    // Parse Paynow response format
    parsePaynowResponse(responseText) {
        const lines = responseText.split('\n');
        const data = {};

        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                data[key.toLowerCase()] = value;
            }
        });

        return data;
    }

    // Handle payment result webhook
    async handlePaymentResult(resultData) {
        try {
            // Verify hash
            const isValid = this.verifyHash({ ...resultData }, this.integrationKey);
            
            if (!isValid) {
                throw new Error('Invalid payment result hash');
            }

            return {
                valid: true,
                reference: resultData.reference,
                paynowReference: resultData.paynowreference,
                amount: parseFloat(resultData.amount || 0),
                status: resultData.status,
                paid: resultData.paid === 'Yes'
            };

        } catch (error) {
            console.error('Payment result handling error:', error);
            return {
                valid: false,
                error: error.message
            };
        }
    }

    // Generate unique payment reference
    generatePaymentReference(applicationId) {
        const timestamp = Date.now().toString().slice(-8);
        const appIdShort = applicationId.toString().slice(-6);
        return `HC-${appIdShort}-${timestamp}`;
    }

    // Calculate payment amount based on plan
    calculatePaymentAmount(plan) {
        const planPrices = {
            starter: 12.00,
            professional: 19.00,
            enterprise: 39.00
        };

        return planPrices[plan] || planPrices.starter;
    }

    // Create subscription payment
    async createSubscriptionPayment(application) {
        const amount = this.calculatePaymentAmount(application.selectedPlan);
        const reference = this.generatePaymentReference(application._id);

        return await this.createPayment({
            reference,
            amount,
            email: application.email,
            phone: application.phone,
            description: `Helensvale Connect ${application.selectedPlan} Plan - ${application.businessName}`
        });
    }

    // Mobile money specific methods
    async createEcoCashPayment(paymentData) {
        // EcoCash payments through Paynow
        return await this.createPayment({
            ...paymentData,
            description: `${paymentData.description} (EcoCash)`
        });
    }

    async createOneMoneyPayment(paymentData) {
        // OneMoney payments through Paynow
        return await this.createPayment({
            ...paymentData,
            description: `${paymentData.description} (OneMoney)`
        });
    }

    // Payment status constants
    static get PAYMENT_STATUS() {
        return {
            CREATED: 'Created',
            SENT: 'Sent',
            PAID: 'Paid',
            AWAITING_DELIVERY: 'Awaiting Delivery',
            DELIVERED: 'Delivered',
            CANCELLED: 'Cancelled',
            DISPUTED: 'Disputed',
            REFUNDED: 'Refunded'
        };
    }
}

module.exports = new PaynowService();
