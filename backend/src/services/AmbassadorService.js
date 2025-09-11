const crypto = require('crypto');
const mongoose = require('mongoose');

class AmbassadorService {
  constructor() {
    this.referralTiers = {
      bronze: { minReferrals: 0, commission: 0.05, bonuses: [] },
      silver: { minReferrals: 10, commission: 0.08, bonuses: ['priority_support'] },
      gold: { minReferrals: 25, commission: 0.12, bonuses: ['priority_support', 'exclusive_events'] },
      platinum: { minReferrals: 50, commission: 0.15, bonuses: ['priority_support', 'exclusive_events', 'co_marketing'] },
      diamond: { minReferrals: 100, commission: 0.20, bonuses: ['priority_support', 'exclusive_events', 'co_marketing', 'revenue_share'] }
    };
  }

  // Create ambassador profile
  async createAmbassador(userId, applicationData) {
    try {
      const {
        socialMediaHandles,
        audienceSize,
        niche,
        previousExperience,
        motivationStatement,
        contentSamples
      } = applicationData;

      const ambassador = {
        id: crypto.randomUUID(),
        userId,
        referralCode: this.generateReferralCode(),
        status: 'pending_approval',
        tier: 'bronze',
        profile: {
          socialMediaHandles: socialMediaHandles || {},
          audienceSize: audienceSize || 0,
          niche: niche || 'general',
          previousExperience,
          motivationStatement,
          contentSamples: contentSamples || []
        },
        metrics: {
          totalReferrals: 0,
          successfulReferrals: 0,
          totalEarnings: 0,
          conversionRate: 0,
          clickThroughRate: 0
        },
        specialFeatures: {
          customLandingPage: true,
          analyticsAccess: true,
          marketingMaterials: true,
          directSupport: false
        },
        createdAt: new Date(),
        approvedAt: null,
        lastActiveAt: new Date()
      };

      return {
        success: true,
        ambassador,
        message: 'Ambassador application submitted successfully. You will be notified once approved.'
      };
    } catch (error) {
      console.error('Ambassador creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate unique referral code
  generateReferralCode() {
    const prefix = 'HC';
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${randomPart}`;
  }

  // Process referral signup
  async processReferral(referralCode, newUserData) {
    try {
      // Find ambassador by referral code
      const ambassador = await this.getAmbassadorByCode(referralCode);
      if (!ambassador) {
        return {
          success: false,
          error: 'Invalid referral code'
        };
      }

      const referral = {
        id: crypto.randomUUID(),
        ambassadorId: ambassador.id,
        referralCode,
        referredUser: {
          id: newUserData.userId,
          email: newUserData.email,
          signupDate: new Date(),
          firstPurchaseDate: null,
          totalSpent: 0
        },
        status: 'pending', // pending, converted, cancelled
        commission: {
          rate: this.referralTiers[ambassador.tier].commission,
          earned: 0,
          paid: false
        },
        createdAt: new Date(),
        convertedAt: null
      };

      // Update ambassador metrics
      await this.updateAmbassadorMetrics(ambassador.id, 'referral_created');

      return {
        success: true,
        referral,
        welcomeBonus: this.getWelcomeBonus(ambassador.tier),
        message: 'Referral processed successfully'
      };
    } catch (error) {
      console.error('Referral processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get welcome bonus for referred users
  getWelcomeBonus(ambassadorTier) {
    const bonuses = {
      bronze: { type: 'discount', value: 10, description: '10% off first booking' },
      silver: { type: 'discount', value: 15, description: '15% off first booking' },
      gold: { type: 'credit', value: 10, description: '$10 USD credit for first booking' },
      platinum: { type: 'credit', value: 15, description: '$15 USD credit for first booking' },
      diamond: { type: 'credit', value: 20, description: '$20 USD credit for first booking' }
    };

    return bonuses[ambassadorTier] || bonuses.bronze;
  }

  // Update ambassador tier based on performance
  async updateAmbassadorTier(ambassadorId) {
    try {
      const ambassador = await this.getAmbassadorById(ambassadorId);
      if (!ambassador) {
        throw new Error('Ambassador not found');
      }

      const currentReferrals = ambassador.metrics.successfulReferrals;
      let newTier = 'bronze';

      // Determine new tier
      if (currentReferrals >= 100) newTier = 'diamond';
      else if (currentReferrals >= 50) newTier = 'platinum';
      else if (currentReferrals >= 25) newTier = 'gold';
      else if (currentReferrals >= 10) newTier = 'silver';

      if (newTier !== ambassador.tier) {
        // Tier upgrade
        ambassador.tier = newTier;
        ambassador.specialFeatures = this.getTierFeatures(newTier);

        // Send tier upgrade notification
        await this.sendTierUpgradeNotification(ambassadorId, newTier);

        return {
          success: true,
          oldTier: ambassador.tier,
          newTier,
          newFeatures: ambassador.specialFeatures,
          message: `Congratulations! You've been upgraded to ${newTier.toUpperCase()} tier!`
        };
      }

      return {
        success: true,
        tier: ambassador.tier,
        message: 'Tier unchanged'
      };
    } catch (error) {
      console.error('Tier update failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get tier-specific features
  getTierFeatures(tier) {
    const features = {
      bronze: {
        customLandingPage: true,
        analyticsAccess: true,
        marketingMaterials: true,
        directSupport: false,
        exclusiveEvents: false,
        coMarketing: false,
        revenueShare: false
      },
      silver: {
        customLandingPage: true,
        analyticsAccess: true,
        marketingMaterials: true,
        directSupport: true,
        exclusiveEvents: false,
        coMarketing: false,
        revenueShare: false
      },
      gold: {
        customLandingPage: true,
        analyticsAccess: true,
        marketingMaterials: true,
        directSupport: true,
        exclusiveEvents: true,
        coMarketing: false,
        revenueShare: false
      },
      platinum: {
        customLandingPage: true,
        analyticsAccess: true,
        marketingMaterials: true,
        directSupport: true,
        exclusiveEvents: true,
        coMarketing: true,
        revenueShare: false
      },
      diamond: {
        customLandingPage: true,
        analyticsAccess: true,
        marketingMaterials: true,
        directSupport: true,
        exclusiveEvents: true,
        coMarketing: true,
        revenueShare: true
      }
    };

    return features[tier] || features.bronze;
  }

  // Generate marketing materials for ambassador
  async generateMarketingMaterials(ambassadorId, type = 'all') {
    try {
      const ambassador = await this.getAmbassadorById(ambassadorId);
      if (!ambassador) {
        throw new Error('Ambassador not found');
      }

      const materials = {
        socialMediaPosts: [
          {
            platform: 'instagram',
            content: `🌟 Just discovered HelensvaleConnect - the best way to find local services! Use my code ${ambassador.referralCode} and get ${this.getWelcomeBonus(ambassador.tier).description}! 💫 #HelensvaleConnect #LocalServices`,
            image: 'instagram_story_template.jpg'
          },
          {
            platform: 'facebook',
            content: `Hey friends! 👋 I'm excited to share HelensvaleConnect with you - it's revolutionizing how we find local services! From cleaning to tutoring, everything you need is right here. Use my referral code ${ambassador.referralCode} for a special welcome bonus! 🎉`,
            image: 'facebook_post_template.jpg'
          },
          {
            platform: 'twitter',
            content: `Found the perfect platform for local services! 🎯 @HelensvaleConnect makes booking so easy. Use code ${ambassador.referralCode} for a welcome bonus! #LocalServices #HelensvaleConnect`,
            image: 'twitter_card_template.jpg'
          }
        ],
        emailTemplates: [
          {
            subject: 'Discover Amazing Local Services with HelensvaleConnect',
            content: `Hi there!\n\nI wanted to share something exciting with you - HelensvaleConnect! It's this amazing platform where you can find and book local services with just a few clicks.\n\nWhether you need cleaning, tutoring, beauty services, or handyman work, they have vetted professionals ready to help.\n\nThe best part? Use my referral code ${ambassador.referralCode} and you'll get ${this.getWelcomeBonus(ambassador.tier).description}!\n\nCheck it out: https://helensvaleconnect.art?ref=${ambassador.referralCode}\n\nBest regards,\n[Your Name]`
          }
        ],
        bannerAds: [
          {
            size: '728x90',
            url: `https://helensvaleconnect.art/banners/leaderboard_${ambassador.referralCode}.jpg`,
            code: `<a href="https://helensvaleconnect.art?ref=${ambassador.referralCode}"><img src="https://helensvaleconnect.art/banners/leaderboard_${ambassador.referralCode}.jpg" alt="HelensvaleConnect - Local Services" /></a>`
          },
          {
            size: '300x250',
            url: `https://helensvaleconnect.art/banners/rectangle_${ambassador.referralCode}.jpg`,
            code: `<a href="https://helensvaleconnect.art?ref=${ambassador.referralCode}"><img src="https://helensvaleconnect.art/banners/rectangle_${ambassador.referralCode}.jpg" alt="HelensvaleConnect - Local Services" /></a>`
          }
        ],
        customLandingPage: {
          url: `https://helensvaleconnect.art/ambassador/${ambassador.referralCode}`,
          features: [
            'Personalized welcome message',
            'Ambassador introduction',
            'Special offer highlight',
            'Easy signup process',
            'Success stories'
          ]
        }
      };

      return {
        success: true,
        materials,
        downloadLinks: {
          allMaterials: `https://helensvaleconnect.art/api/ambassadors/${ambassadorId}/materials/download`,
          socialMedia: `https://helensvaleconnect.art/api/ambassadors/${ambassadorId}/materials/social`,
          banners: `https://helensvaleconnect.art/api/ambassadors/${ambassadorId}/materials/banners`
        }
      };
    } catch (error) {
      console.error('Marketing materials generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get ambassador performance analytics
  async getAmbassadorAnalytics(ambassadorId, period = '30d') {
    try {
      // Mock analytics data
      const analytics = {
        ambassadorId,
        period,
        summary: {
          totalClicks: Math.floor(Math.random() * 500) + 100,
          totalSignups: Math.floor(Math.random() * 50) + 10,
          totalConversions: Math.floor(Math.random() * 20) + 5,
          totalEarnings: (Math.random() * 1000 + 200).toFixed(2),
          conversionRate: (Math.random() * 10 + 5).toFixed(2) + '%',
          averageOrderValue: (Math.random() * 200 + 100).toFixed(2)
        },
        topPerformingChannels: [
          { channel: 'Instagram', clicks: 156, conversions: 8 },
          { channel: 'Facebook', clicks: 134, conversions: 6 },
          { channel: 'WhatsApp', clicks: 89, conversions: 4 }
        ],
        recentReferrals: [
          { date: '2024-01-10', user: 'user***@email.com', status: 'converted', earnings: '$8.50 USD' },
          { date: '2024-01-09', user: 'user***@email.com', status: 'pending', earnings: '$0.00 USD' },
          { date: '2024-01-08', user: 'user***@email.com', status: 'converted', earnings: '$6.25 USD' }
        ],
        monthlyTrend: [
          { month: 'Oct', referrals: 8, earnings: 45.50 },
          { month: 'Nov', referrals: 12, earnings: 72.20 },
          { month: 'Dec', referrals: 15, earnings: 86.80 },
          { month: 'Jan', referrals: 18, earnings: 98.40 }
        ]
      };

      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Analytics retrieval failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create special ambassador offers
  async createSpecialOffer(ambassadorId, offerData) {
    try {
      const {
        title,
        description,
        discountType, // percentage, fixed, credit
        discountValue,
        validUntil,
        maxUses,
        targetAudience
      } = offerData;

      const offer = {
        id: crypto.randomUUID(),
        ambassadorId,
        title,
        description,
        code: `${this.generateReferralCode()}SPECIAL`,
        discountType,
        discountValue,
        validFrom: new Date(),
        validUntil: new Date(validUntil),
        maxUses: maxUses || 100,
        currentUses: 0,
        targetAudience: targetAudience || 'all',
        status: 'active',
        createdAt: new Date()
      };

      return {
        success: true,
        offer,
        promotionalContent: {
          headline: `Exclusive ${discountValue}${discountType === 'percentage' ? '%' : ' USD'} Off!`,
          description: `Limited time offer from your trusted ambassador. Use code ${offer.code}`,
          urgency: `Only ${maxUses} uses available - expires ${new Date(validUntil).toLocaleDateString()}`
        }
      };
    } catch (error) {
      console.error('Special offer creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get ambassador leaderboard
  async getLeaderboard(period = 'monthly') {
    try {
      // Mock leaderboard data
      const leaderboard = [
        {
          rank: 1,
          ambassadorId: 'amb_001',
          name: 'Sarah M.',
          tier: 'diamond',
          referrals: 45,
          earnings: 450.50,
          badge: '🏆'
        },
        {
          rank: 2,
          ambassadorId: 'amb_002',
          name: 'Mike T.',
          tier: 'platinum',
          referrals: 38,
          earnings: 365.25,
          badge: '🥈'
        },
        {
          rank: 3,
          ambassadorId: 'amb_003',
          name: 'Lisa K.',
          tier: 'gold',
          referrals: 32,
          earnings: 285.75,
          badge: '🥉'
        },
        {
          rank: 4,
          ambassadorId: 'amb_004',
          name: 'John D.',
          tier: 'gold',
          referrals: 28,
          earnings: 240.00,
          badge: '⭐'
        },
        {
          rank: 5,
          ambassadorId: 'amb_005',
          name: 'Emma R.',
          tier: 'silver',
          referrals: 24,
          earnings: 195.50,
          badge: '⭐'
        }
      ];

      return {
        success: true,
        leaderboard,
        period,
        totalAmbassadors: 156,
        prizes: {
          first: '$95 USD bonus + Exclusive HelensvaleConnect merchandise',
          second: '$60 USD bonus + Priority support for 3 months',
          third: '$40 USD bonus + Featured ambassador spotlight'
        }
      };
    } catch (error) {
      console.error('Leaderboard retrieval failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mock database methods (to be replaced with actual database calls)
  async getAmbassadorByCode(referralCode) {
    // Mock implementation
    return {
      id: 'amb_001',
      referralCode,
      tier: 'silver',
      status: 'active'
    };
  }

  async getAmbassadorById(ambassadorId) {
    // Mock implementation
    return {
      id: ambassadorId,
      tier: 'silver',
      metrics: { successfulReferrals: 15 }
    };
  }

  async updateAmbassadorMetrics(ambassadorId, action) {
    // Mock implementation
    console.log(`Updated metrics for ${ambassadorId}: ${action}`);
  }

  async sendTierUpgradeNotification(ambassadorId, newTier) {
    // Mock implementation
    console.log(`Sent tier upgrade notification to ${ambassadorId}: ${newTier}`);
  }
}

// Singleton instance
const ambassadorService = new AmbassadorService();

module.exports = ambassadorService;
