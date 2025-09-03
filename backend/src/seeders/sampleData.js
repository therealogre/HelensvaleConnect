const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');

const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+61412345678',
    password: 'TestPass123!',
    role: 'customer',
    isVerified: true,
    address: {
      street: '123 Main Street',
      city: 'Helensvale',
      state: 'QLD',
      zipCode: '4212',
      country: 'Australia'
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+61423456789',
    password: 'TestPass123!',
    role: 'vendor',
    isVerified: true,
    address: {
      street: '456 Oak Avenue',
      city: 'Helensvale',
      state: 'QLD',
      zipCode: '4212',
      country: 'Australia'
    }
  },
  {
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@example.com',
    phone: '+61434567890',
    password: 'TestPass123!',
    role: 'vendor',
    isVerified: true,
    address: {
      street: '789 Pine Road',
      city: 'Helensvale',
      state: 'QLD',
      zipCode: '4212',
      country: 'Australia'
    }
  },
  {
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@example.com',
    phone: '+61445678901',
    password: 'TestPass123!',
    role: 'customer',
    isVerified: true,
    address: {
      street: '321 Cedar Lane',
      city: 'Helensvale',
      state: 'QLD',
      zipCode: '4212',
      country: 'Australia'
    }
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    phone: '+61456789012',
    password: 'TestPass123!',
    role: 'vendor',
    isVerified: true,
    address: {
      street: '654 Elm Street',
      city: 'Helensvale',
      state: 'QLD',
      zipCode: '4212',
      country: 'Australia'
    }
  }
];

const sampleVendors = [
  {
    businessName: "Sarah's Hair Studio",
    businessType: 'beauty',
    description: 'Professional hair styling and beauty services in the heart of Helensvale. Specializing in cuts, colors, and special occasion styling.',
    location: {
      address: {
        street: '456 Oak Avenue',
        city: 'Helensvale',
        state: 'QLD',
        zipCode: '4212',
        country: 'Australia'
      },
      coordinates: {
        latitude: -27.8629,
        longitude: 153.3267
      }
    },
    contact: {
      phone: '+61423456789',
      email: 'sarah.johnson@example.com',
      website: 'https://sarahshairstudio.com.au'
    },
    services: [
      {
        name: 'Haircut & Style',
        category: 'Beauty & Personal Care',
        description: 'Professional haircut with wash and style',
        price: 65,
        duration: 60,
        isActive: true
      },
      {
        name: 'Hair Color',
        category: 'Beauty & Personal Care',
        description: 'Full hair coloring service with consultation',
        price: 120,
        duration: 120,
        isActive: true
      },
      {
        name: 'Special Event Styling',
        category: 'Beauty & Personal Care',
        description: 'Hair styling for weddings and special events',
        price: 85,
        duration: 90,
        isActive: true
      }
    ],
    operatingHours: [
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
      { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '15:00' }
    ],
    rating: 4.8,
    reviewCount: 24,
    isActive: true,
    isVerified: true
  },
  {
    businessName: "Mike's Fitness Training",
    businessType: 'fitness',
    description: 'Personal fitness training and group classes. Helping you achieve your fitness goals with personalized workout plans.',
    location: {
      address: {
        street: '789 Pine Road',
        city: 'Helensvale',
        state: 'QLD',
        zipCode: '4212',
        country: 'Australia'
      },
      coordinates: {
        latitude: -27.8635,
        longitude: 153.3275
      }
    },
    contact: {
      phone: '+61434567890',
      email: 'mike.wilson@example.com',
      website: 'https://mikesfitness.com.au'
    },
    services: [
      {
        name: 'Personal Training Session',
        category: 'Fitness & Sports',
        description: 'One-on-one personal training session',
        price: 80,
        duration: 60,
        isActive: true
      },
      {
        name: 'Group Fitness Class',
        category: 'Fitness & Sports',
        description: 'Small group fitness class (max 6 people)',
        price: 25,
        duration: 45,
        isActive: true
      },
      {
        name: 'Fitness Assessment',
        category: 'Fitness & Sports',
        description: 'Complete fitness assessment and goal setting',
        price: 50,
        duration: 90,
        isActive: true
      }
    ],
    operatingHours: [
      { day: 'monday', isOpen: true, openTime: '06:00', closeTime: '20:00' },
      { day: 'tuesday', isOpen: true, openTime: '06:00', closeTime: '20:00' },
      { day: 'wednesday', isOpen: true, openTime: '06:00', closeTime: '20:00' },
      { day: 'thursday', isOpen: true, openTime: '06:00', closeTime: '20:00' },
      { day: 'friday', isOpen: true, openTime: '06:00', closeTime: '20:00' },
      { day: 'saturday', isOpen: true, openTime: '07:00', closeTime: '18:00' },
      { day: 'sunday', isOpen: true, openTime: '08:00', closeTime: '16:00' }
    ],
    rating: 4.9,
    reviewCount: 18,
    isActive: true,
    isVerified: true
  },
  {
    businessName: "David's Home Services",
    businessType: 'service',
    description: 'Professional home maintenance and repair services. From plumbing to electrical work, we handle it all.',
    location: {
      address: {
        street: '654 Elm Street',
        city: 'Helensvale',
        state: 'QLD',
        zipCode: '4212',
        country: 'Australia'
      },
      coordinates: {
        latitude: -27.8640,
        longitude: 153.3280
      }
    },
    contact: {
      phone: '+61456789012',
      email: 'david.brown@example.com',
      website: 'https://davidshomeservices.com.au'
    },
    services: [
      {
        name: 'Plumbing Repair',
        category: 'Home Services',
        description: 'General plumbing repairs and maintenance',
        price: 120,
        duration: 120,
        isActive: true
      },
      {
        name: 'Electrical Work',
        category: 'Home Services',
        description: 'Licensed electrical repairs and installations',
        price: 150,
        duration: 180,
        isActive: true
      },
      {
        name: 'Home Maintenance Check',
        category: 'Home Services',
        description: 'Comprehensive home maintenance inspection',
        price: 200,
        duration: 240,
        isActive: true
      }
    ],
    operatingHours: [
      { day: 'monday', isOpen: true, openTime: '07:00', closeTime: '17:00' },
      { day: 'tuesday', isOpen: true, openTime: '07:00', closeTime: '17:00' },
      { day: 'wednesday', isOpen: true, openTime: '07:00', closeTime: '17:00' },
      { day: 'thursday', isOpen: true, openTime: '07:00', closeTime: '17:00' },
      { day: 'friday', isOpen: true, openTime: '07:00', closeTime: '17:00' },
      { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '14:00' },
      { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '12:00' }
    ],
    rating: 4.7,
    reviewCount: 31,
    isActive: true,
    isVerified: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (let userData of sampleUsers) {
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
    }

    // Create vendors (link to vendor users)
    const vendorUsers = createdUsers.filter(user => user.role === 'vendor');
    
    for (let i = 0; i < sampleVendors.length; i++) {
      const vendorData = { ...sampleVendors[i] };
      vendorData.user = vendorUsers[i]._id;
      
      const vendor = await Vendor.create(vendorData);
      console.log(`✅ Created vendor: ${vendor.businessName}`);
    }

    // Create sample bookings
    const customers = createdUsers.filter(user => user.role === 'customer');
    const vendors = await Vendor.find({});

    const sampleBookings = [
      {
        customer: customers[0]._id,
        vendor: vendors[0]._id,
        service: {
          id: vendors[0].services[0]._id,
          name: vendors[0].services[0].name,
          price: vendors[0].services[0].price,
          duration: vendors[0].services[0].duration
        },
        bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        timeSlot: {
          startTime: '10:00',
          endTime: '11:00'
        },
        status: 'confirmed',
        totalAmount: vendors[0].services[0].price,
        payment: {
          method: 'card',
          status: 'paid',
          paidAmount: vendors[0].services[0].price
        },
        customerDetails: {
          notes: 'First time customer, looking forward to the service!'
        }
      },
      {
        customer: customers[1]._id,
        vendor: vendors[1]._id,
        service: {
          id: vendors[1].services[0]._id,
          name: vendors[1].services[0].name,
          price: vendors[1].services[0].price,
          duration: vendors[1].services[0].duration
        },
        bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timeSlot: {
          startTime: '14:00',
          endTime: '15:00'
        },
        status: 'pending',
        totalAmount: vendors[1].services[0].price,
        payment: {
          method: 'cash',
          status: 'pending',
          paidAmount: 0
        },
        customerDetails: {
          notes: 'Regular customer, usual workout routine'
        }
      }
    ];

    for (let bookingData of sampleBookings) {
      const booking = await Booking.create(bookingData);
      console.log(`✅ Created booking: ${booking._id}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users, ${vendors.length} vendors, and ${sampleBookings.length} bookings`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing database...');
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

module.exports = {
  seedDatabase,
  clearDatabase,
  sampleUsers,
  sampleVendors
};
