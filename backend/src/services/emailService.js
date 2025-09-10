const nodemailer = require('nodemailer');
const MailerLite = require('mailerlite-api-v2-node').default;

class EmailService {
    constructor() {
        // Initialize MailerLite (free tier: 1,000 subscribers, 12,000 emails/month)
        this.mailerLite = new MailerLite(process.env.MAILERLITE_API_KEY);
        
        // Initialize Nodemailer for transactional emails
        this.transporter = nodemailer.createTransporter({
            service: 'gmail', // or your preferred email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // MailerLite Group IDs
        this.groups = {
            EARLY_ACCESS: process.env.MAILERLITE_EARLY_ACCESS_GROUP_ID,
            APPROVED_BUSINESSES: process.env.MAILERLITE_APPROVED_GROUP_ID,
            PENDING_PAYMENT: process.env.MAILERLITE_PENDING_PAYMENT_GROUP_ID
        };
    }

    // Add subscriber to MailerLite
    async addSubscriber(email, name, groupId, customFields = {}) {
        try {
            const subscriber = {
                email,
                name,
                fields: {
                    business_name: customFields.businessName || '',
                    business_type: customFields.businessType || '',
                    phone: customFields.phone || '',
                    city: customFields.city || '',
                    selected_plan: customFields.selectedPlan || '',
                    application_status: customFields.status || 'pending',
                    ...customFields
                }
            };

            const response = await this.mailerLite.addSubscriberToGroup(groupId, subscriber);
            return response.body;
        } catch (error) {
            console.error('MailerLite subscription error:', error);
            throw error;
        }
    }

    // Update subscriber information
    async updateSubscriber(subscriberId, updates) {
        try {
            const response = await this.mailerLite.updateSubscriber(subscriberId, updates);
            return response.body;
        } catch (error) {
            console.error('MailerLite update error:', error);
            throw error;
        }
    }

    // Send email verification email
    async sendVerificationEmail(email, firstName, verificationUrl) {
        const emailTemplate = this.getVerificationEmailTemplate(firstName, verificationUrl);
        
        return await this.sendTransactionalEmail({
            to: email,
            subject: 'Verify Your Email - Helensvale Connect',
            html: emailTemplate
        });
    }

    // Send application received email
    async sendApplicationReceivedEmail(application) {
        const emailTemplate = this.getApplicationReceivedTemplate(application);
        
        // Send via MailerLite automation or transactional email
        return await this.sendTransactionalEmail({
            to: application.email,
            subject: 'Your Helensvale Connect Application is Being Reviewed',
            html: emailTemplate
        });
    }

    // Send application approved email
    async sendApplicationApprovedEmail(application) {
        const emailTemplate = this.getApplicationApprovedTemplate(application);
        
        return await this.sendTransactionalEmail({
            to: application.email,
            subject: 'Welcome to Helensvale Connect - Your Application is Approved!',
            html: emailTemplate
        });
    }

    // Send payment reminder email
    async sendPaymentReminderEmail(application) {
        const emailTemplate = this.getPaymentReminderTemplate(application);
        
        return await this.sendTransactionalEmail({
            to: application.email,
            subject: 'Complete Your Helensvale Connect Registration - Payment Pending',
            html: emailTemplate
        });
    }

    // Send store creation invitation
    async sendStoreCreationInvite(application, paymentReference) {
        const emailTemplate = this.getStoreCreationTemplate(application, paymentReference);
        
        return await this.sendTransactionalEmail({
            to: application.email,
            subject: 'Time to Build Your Store - Helensvale Connect',
            html: emailTemplate
        });
    }

    // Send transactional email
    async sendTransactionalEmail({ to, subject, html, text }) {
        try {
            const mailOptions = {
                from: `"Helensvale Connect" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text: text || this.stripHtml(html)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }

    // Email Templates
    getApplicationReceivedTemplate(application) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Received - Helensvale Connect</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
                .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
                .status-badge { background: #fbbf24; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Application Received!</h1>
                    <p>Thank you for joining Zimbabwe's #1 Marketplace</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${application.ownerName},</h2>
                    
                    <p>We're thrilled to receive your application for <strong>${application.businessName}</strong> to join Helensvale Connect!</p>
                    
                    <div class="highlight">
                        <h3>What happens next?</h3>
                        <ol>
                            <li><strong>Review Process (24-48 hours)</strong> - Our team will review your application</li>
                            <li><strong>Approval Notification</strong> - You'll receive an email with next steps</li>
                            <li><strong>Payment & Store Creation</strong> - Complete payment and build your store</li>
                            <li><strong>Go Live</strong> - Your business goes live on our platform</li>
                        </ol>
                    </div>
                    
                    <h3>Your Application Details:</h3>
                    <ul>
                        <li><strong>Business:</strong> ${application.businessName}</li>
                        <li><strong>Type:</strong> ${application.businessType}</li>
                        <li><strong>Plan:</strong> ${application.selectedPlan} ($${application.planPrice}/month)</li>
                        <li><strong>Location:</strong> ${application.city}, ${application.country}</li>
                        <li><strong>Status:</strong> <span class="status-badge">Under Review</span></li>
                    </ul>
                    
                    <h3>Why We Built Helensvale Connect</h3>
                    <p>After years of seeing talented African businesses struggle with limited online presence, we knew something had to change. We've endured countless challenges, from technical hurdles to funding obstacles, all to create a platform that truly serves our community.</p>
                    
                    <p>Thank you for your patience as we've worked tirelessly to make this vision a reality. Your business is exactly why we built this platform - to give every African entrepreneur the tools they deserve to thrive.</p>
                    
                    <div class="highlight">
                        <h4>🎉 Pioneer Business Benefits:</h4>
                        <ul>
                            <li>Lifetime 50% discount on all plans</li>
                            <li>Priority customer support</li>
                            <li>Featured placement on our homepage</li>
                            <li>Direct access to our founder team</li>
                            <li>Exclusive networking events</li>
                        </ul>
                    </div>
                    
                    <p>Questions? Reply to this email or call us at +263 XXX XXXX. We're here to help!</p>
                    
                    <p>Best regards,<br>
                    <strong>The Helensvale Connect Team</strong><br>
                    <em>Building Africa's Digital Future, One Business at a Time</em></p>
                </div>
                
                <div class="footer">
                    <p>&copy; 2025 Helensvale Connect. All rights reserved.</p>
                    <p>Zimbabwe's Leading Business Marketplace</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getApplicationApprovedTemplate(application) {
        const paymentUrl = `${process.env.FRONTEND_URL}/payment/${application._id}`;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Helensvale Connect!</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
                .btn { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
                .btn:hover { background: #059669; }
                .success-badge { background: #10b981; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
                .highlight { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
                .pricing { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations!</h1>
                    <p>Your application has been approved!</p>
                    <span class="success-badge">APPROVED</span>
                </div>
                
                <div class="content">
                    <h2>Welcome to the family, ${application.ownerName}!</h2>
                    
                    <p>We're excited to officially welcome <strong>${application.businessName}</strong> to Helensvale Connect - Zimbabwe's premier business marketplace!</p>
                    
                    <div class="highlight">
                        <h3>🚀 What We'll Do For You:</h3>
                        <ul>
                            <li><strong>Professional Store Creation</strong> - We'll build a stunning, conversion-optimized store tailored to your business type</li>
                            <li><strong>Marketing & Promotion</strong> - Featured placement on our homepage and marketing campaigns</li>
                            <li><strong>Customer Acquisition</strong> - Direct access to thousands of potential customers</li>
                            <li><strong>Payment Processing</strong> - Seamless EcoCash, OneMoney, and bank transfer integration</li>
                            <li><strong>Analytics & Insights</strong> - Detailed performance tracking and business intelligence</li>
                            <li><strong>Ongoing Support</strong> - Dedicated account management and technical support</li>
                        </ul>
                    </div>
                    
                    <div class="pricing">
                        <h3>Your Selected Plan: ${application.selectedPlan.toUpperCase()}</h3>
                        <p><strong>Monthly Investment:</strong> $${application.planPrice}</p>
                        <p><strong>Pioneer Discount:</strong> 50% off for life!</p>
                        <p><strong>Setup Fee:</strong> $0 (normally $99)</p>
                        <p><strong>What's Included:</strong> Everything you need to succeed online</p>
                    </div>
                    
                    <h3>How We'll Work Together:</h3>
                    <ol>
                        <li><strong>Complete Payment</strong> - Secure your spot with our integrated PayNow system</li>
                        <li><strong>Store Design Session</strong> - We'll schedule a call to understand your vision</li>
                        <li><strong>Professional Store Build</strong> - Our team creates your custom store</li>
                        <li><strong>Content & Photos</strong> - We'll help optimize your business presentation</li>
                        <li><strong>Launch & Promotion</strong> - Go live with full marketing support</li>
                        <li><strong>Growth & Optimization</strong> - Ongoing support to maximize your success</li>
                    </ol>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${paymentUrl}" class="btn">Complete Payment & Get Started</a>
                    </div>
                    
                    <div class="highlight">
                        <h4>💡 Why Choose Helensvale Connect?</h4>
                        <p>We're not just another platform - we're your growth partners. Every feature, every design decision, every support interaction is focused on one thing: making your business more successful.</p>
                        
                        <p>We've invested years building relationships with customers across Zimbabwe, and now we're ready to connect them directly with quality businesses like yours.</p>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <p>1. Click the payment button above to secure your spot<br>
                    2. Check your email for store creation instructions<br>
                    3. Schedule your design consultation call</p>
                    
                    <p>Questions? Reply to this email or call us at +263 XXX XXXX. We're here to ensure your success!</p>
                    
                    <p>Excited to work with you,<br>
                    <strong>The Helensvale Connect Team</strong><br>
                    <em>Your Partners in Digital Growth</em></p>
                </div>
                
                <div class="footer">
                    <p>&copy; 2025 Helensvale Connect. All rights reserved.</p>
                    <p>Zimbabwe's Leading Business Marketplace</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getPaymentReminderTemplate(application) {
        const paymentUrl = `${process.env.FRONTEND_URL}/payment/${application._id}`;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Complete Your Registration - Helensvale Connect</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
                .btn { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
                .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
                .countdown { background: #dc2626; color: white; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⏰ Don't Miss Out!</h1>
                    <p>Complete your Helensvale Connect registration</p>
                </div>
                
                <div class="content">
                    <h2>Hi ${application.ownerName},</h2>
                    
                    <p>Your application for <strong>${application.businessName}</strong> has been approved, but we're still waiting for your payment to complete the registration process.</p>
                    
                    <div class="countdown">
                        <h3>⚡ Limited Time: Pioneer Pricing Ends Soon!</h3>
                        <p>Secure your 50% lifetime discount before it expires</p>
                    </div>
                    
                    <div class="urgent">
                        <h3>What You're Missing:</h3>
                        <ul>
                            <li>Professional store on Zimbabwe's #1 marketplace</li>
                            <li>Immediate access to thousands of customers</li>
                            <li>Featured homepage placement</li>
                            <li>50% lifetime discount (Pioneer pricing)</li>
                            <li>Priority support and account management</li>
                        </ul>
                    </div>
                    
                    <p><strong>Your Plan:</strong> ${application.selectedPlan} - $${application.planPrice}/month</p>
                    <p><strong>Setup Fee:</strong> $0 (saved $99)</p>
                    <p><strong>Pioneer Discount:</strong> 50% off forever</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${paymentUrl}" class="btn">Complete Payment Now</a>
                    </div>
                    
                    <p>Once payment is complete, we'll immediately begin building your professional store and you'll be featured on our homepage within 48 hours.</p>
                    
                    <p>Questions about payment? Reply to this email or call +263 XXX XXXX.</p>
                    
                    <p>Don't let this opportunity slip away,<br>
                    <strong>The Helensvale Connect Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>&copy; 2025 Helensvale Connect. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getStoreCreationTemplate(application, paymentReference) {
        const storeBuilderUrl = `${process.env.FRONTEND_URL}/store-builder/${application._id}?ref=${paymentReference}`;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Time to Build Your Store! - Helensvale Connect</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
                .btn { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
                .success { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
                .steps { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Payment Successful!</h1>
                    <p>Time to build your amazing store</p>
                </div>
                
                <div class="content">
                    <h2>Congratulations ${application.ownerName}!</h2>
                    
                    <div class="success">
                        <h3>✅ Payment Confirmed</h3>
                        <p><strong>Reference:</strong> ${paymentReference}</p>
                        <p><strong>Plan:</strong> ${application.selectedPlan} ($${application.planPrice}/month)</p>
                        <p><strong>Status:</strong> Active Pioneer Member</p>
                    </div>
                    
                    <p>Welcome to the Helensvale Connect family! You're now ready to create your professional store that will attract customers and grow your business.</p>
                    
                    <div class="steps">
                        <h3>🚀 Your Store Creation Journey:</h3>
                        <ol>
                            <li><strong>Choose Your Template</strong> - Select from business-specific designs</li>
                            <li><strong>Upload Your Branding</strong> - Logo, photos, and brand colors</li>
                            <li><strong>Add Your Services</strong> - List what you offer with pricing</li>
                            <li><strong>Set Your Hours</strong> - Operating schedule and availability</li>
                            <li><strong>Payment Setup</strong> - Configure EcoCash, OneMoney, etc.</li>
                            <li><strong>Preview & Launch</strong> - Review and go live!</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${storeBuilderUrl}" class="btn">Start Building Your Store</a>
                    </div>
                    
                    <h3>🎨 Professional Design Options:</h3>
                    <p>Our store builder includes templates specifically designed for ${application.businessType} businesses. If you don't find a design you love, you can request a custom design for just $49 (normally $199) - we'll work with you personally to create something unique.</p>
                    
                    <h3>📈 What Happens After You Build:</h3>
                    <ul>
                        <li>Your store goes live immediately</li>
                        <li>Featured placement on our homepage</li>
                        <li>Inclusion in our marketing campaigns</li>
                        <li>Access to our customer base</li>
                        <li>Monthly performance reports</li>
                    </ul>
                    
                    <p><strong>Need Help?</strong> Our team is standing by to assist you. Reply to this email or call +263 XXX XXXX for immediate support.</p>
                    
                    <p>Excited to see what you build,<br>
                    <strong>The Helensvale Connect Team</strong><br>
                    <em>Your Success is Our Mission</em></p>
                </div>
                
                <div class="footer">
                    <p>&copy; 2025 Helensvale Connect. All rights reserved.</p>
                    <p>Zimbabwe's Leading Business Marketplace</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Email template for verification
    getVerificationEmailTemplate(firstName, verificationUrl) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Helensvale Connect</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Zimbabwe's #1 Business Marketplace</p>
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Helensvale Connect!</h2>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                    Dear ${firstName},
                </p>
                
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                    Thank you for joining Zimbabwe's leading business marketplace! To complete your registration and access your dashboard, please verify your email address.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                        Verify Email Address
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}" style="color: #6366f1; word-break: break-all;">${verificationUrl}</a>
                </p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
                    <ul style="color: #4b5563; line-height: 1.6;">
                        <li>Verify your email to access your dashboard</li>
                        <li>Choose your subscription plan</li>
                        <li>Create your business store</li>
                        <li>Get featured on our homepage</li>
                    </ul>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
                </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>© 2025 Helensvale Connect. All rights reserved.</p>
                <p>Zimbabwe's #1 Business Marketplace</p>
            </div>
        </div>
        `;
    }

    // Utility function to strip HTML
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
}

module.exports = new EmailService();
