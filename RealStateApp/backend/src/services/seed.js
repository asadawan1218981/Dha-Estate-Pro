const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Property = require('../models/Property');
const Project = require('../models/Project');
const Blog = require('../models/Blog');

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dhaestatepro';
// Pin the database name explicitly (see backend/src/index.js). Without this,
// a connection string with no database path silently uses the driver's
// default "test" database, so seeding and the API can target different
// databases and listings appear missing.
const DB_NAME = process.env.DB_NAME || 'dhaestatepro';

// Beautiful high-fidelity real estate images (each category has 4+ premium image sources)
const VILLA_IMAGES = [
  '/images/1613977257363-707ba9348227.jpg',
  '/images/1613490493576-7fde63acd811.jpg',
  '/images/1600596542815-ffad4c1539a9.jpg',
  '/images/1600585154340-be6161a56a0c.jpg'
];

const APARTMENT_IMAGES = [
  '/images/1545324418-cc1a3fa10c00.jpg',
  '/images/1502672260266-1c1ef2d93688.jpg',
  '/images/1522708323590-d24dbb6b0267.jpg',
  '/images/1560448204-e02f11c3d0e2.jpg'
];

const COMMERCIAL_IMAGES = [
  '/images/1486406146926-c627a92ad1ab.jpg',
  '/images/1497366216548-37526070297c.jpg',
  '/images/1497215728101-856f4ea42174.jpg',
  '/images/1486406146926-c627a92ad1ab.jpg'
];

const PLOT_IMAGES = [
  '/images/1500382017468-9049fed747ef.jpg',
  '/images/1500530855697-b586d89ba3ee.jpg',
  '/images/1500382017468-9049fed747ef.jpg'
];

const ROADS_BY_PHASE = {
  'Phase 1': ['Sunset Boulevard', 'Korangi Road', 'Street 10', 'Commercial Avenue'],
  'Phase 2': ['South Circular Avenue', 'Commercial Street', 'Sunset Street', 'Street 15'],
  'Phase 2 Extension': ['Main Korangi Road', 'Street 4 Extension', 'Liaquat Avenue'],
  'Phase 4': ['Khayaban-e-Bahria', 'Commercial Street 9', 'Street 24', 'Gizri Boulevard'],
  'Phase 5': ['Khayaban-e-Shamsheer', 'Khayaban-e-Tanzeem', 'Khayaban-e-Badar', 'Saba Avenue'],
  'Phase 6': ['Khayaban-e-Shahbaz', 'Khayaban-e-Bukhari', 'Khayaban-e-Muhafiz', 'Khayaban-e-Rahat', 'Saba Avenue'],
  'Phase 7': ['Khayaban-e-Ittehad', 'Khayaban-e-Jami', 'Khayaban-e-Seher', 'Commercial Street A'],
  'Phase 8': ['Khayaban-e-Faisal', 'Khayaban-e-Saadi', 'Khayaban-e-Bilal', 'Abdul Sattar Edhi Avenue', 'Zulfiqar Street'],
  'DHA City': ['Sector 3 Smart Road', 'Main Boulevard DHA City', 'Sector 14 Avenue', 'Smart Sector Road C']
};

const SEED_PROJECTS = [
  {
    title: 'Emaar Panorama',
    description: 'Ultra-luxurious waterfront apartments situated in the premium DHA Phase 8 layout, overlooking the Arabian Sea with direct beach access.',
    location: 'Crescent Bay, DHA Phase 8',
    phase: 'Phase 8',
    images: ['/images/1545324418-cc1a3fa10c00.jpg'],
    status: 'Under Construction',
    priceStarting: '8.5 Crore',
    areaRange: '2, 3 & 4 Bed Luxury Apartments',
    isFeatured: true
  },
  {
    title: 'Creek Vista Extension',
    description: 'Next-generation luxury high-rise residential towers inside Phase 8 Karachi, including double glazed infinity decks and modular kitchens.',
    location: 'Creek Side, DHA Phase 8',
    phase: 'Phase 8',
    images: ['/images/1560448204-e02f11c3d0e2.jpg'],
    status: 'Off-Plan',
    priceStarting: '5.2 Crore',
    areaRange: '3 Bed Penthouses',
    isFeatured: true
  },
  {
    title: 'DHA Oasis Villas',
    description: 'Pre-planned upscale villas in DHA City featuring modern smart grid controls, solar rooftops, and exclusive country club access.',
    location: 'Sector 3, DHA City',
    phase: 'DHA City',
    images: ['/images/1613977257363-707ba9348227.jpg'],
    status: 'Completed',
    priceStarting: '3.8 Crore',
    areaRange: '120, 200, 500 Sq. Yd. Villas',
    isFeatured: true
  },
  {
    title: 'The Crimson Commercial Hub',
    description: 'Highly professional glassmorphic architectural tower in Phase 6 Bukhari area offering world-class corporate offices and ground-floor boutiques.',
    location: 'Main Khayaban-e-Bukhari, DHA Phase 6',
    phase: 'Phase 6',
    images: ['/images/1486406146926-c627a92ad1ab.jpg'],
    status: 'Under Construction',
    priceStarting: '4.5 Crore',
    areaRange: '1000 - 3500 Sq. Ft. Offices',
    isFeatured: false
  }
];

const SEED_BLOGS = [
  {
    title: "Why DHA Phase 8 remains Karachi's Premier Property Investment",
    content: "DHA Phase 8 is widely considered the crown jewel of real estate in Karachi. Boasting coastal views, modern infrastructure, Emaar properties, and low density planning, this phase has experienced a solid 18% annual capitalization growth. In this article, we outline the exact commercial zones that promise maximum returns for investors looking to hold long-term capital assets...",
    slug: 'dha-phase-8-karachi-property-investment-guide',
    category: 'Market Trends',
    tags: ['Phase 8', 'Investment', 'Karachi Properties', 'Real Estate Trend'],
    authorName: 'Saad Fatani',
    authorAvatar: '/images/1560250097-0b93528c311a.jpg',
    coverImage: '/images/1600585154340-be6161a56a0c.jpg',
    isFeatured: true
  },
  {
    title: 'A Complete Buyer Blueprint for DHA City Karachi Plots',
    content: "DHA City Karachi is scaling rapidly with smart electricity microgrids, rapid highway transit access, and top-tier security networks. With prices currently highly attractive compared to older phases, both 125, 250, and 500 square yard plots are seeing high demand. We evaluate the upcoming school sectors, infrastructure milestones, and possession timelines to guide your purchase decision...",
    slug: 'dha-city-karachi-plots-buyer-blueprint',
    category: 'Buying Guides',
    tags: ['DHA City', 'Plots Buying', 'Karachi DHA', 'Smart City'],
    authorName: 'Ali Tabani',
    authorAvatar: '/images/1472099645785-5658abf4ff4e.jpg',
    coverImage: '/images/1500382017468-9049fed747ef.jpg',
    isFeatured: true
  },
  {
    title: 'Modern Construction Standards for Villas in DHA Phase 6',
    content: "Building or purchasing a luxury villa in Khayaban-e-Shahbaz or Khayaban-e-Bukhari requires deep knowledge of building regulations, basement moisture protection, and premium concrete ratios. We discuss current glassmorphism design layouts, architectural wind paths, solar integration, and structural safety parameters in Karachi's coastal climate...",
    slug: 'modern-construction-standards-dha-phase-6-villas',
    category: 'Construction',
    tags: ['Phase 6', 'Construction Standards', 'Villa Design', 'Architectural Tips'],
    authorName: 'Zain DHA Specialist',
    authorAvatar: '/images/1519085360753-af0119f7cbe7.jpg',
    coverImage: '/images/1613490493576-7fde63acd811.jpg',
    isFeatured: false
  }
];

// 10 Core Required categories to ensure no empty screens
const REQUIRED_CATEGORIES = [
  { type: 'HOUSE', status: 'BUY' },
  { type: 'APARTMENT', status: 'BUY' },
  { type: 'PORTION', status: 'BUY' },
  { type: 'PLOT', status: 'BUY' },
  { type: 'COMMERCIAL', status: 'BUY' },
  { type: 'HOUSE', status: 'RENT' },
  { type: 'APARTMENT', status: 'RENT' },
  { type: 'PORTION', status: 'RENT' },
  { type: 'OFFICE', status: 'RENT' },
  { type: 'SHOP', status: 'RENT' }
];

// Helper to generate distinct properties deterministically
const createSampleProperty = (cat, index, agentId) => {
  const phases = Object.keys(ROADS_BY_PHASE);
  const phase = phases[index % phases.length];
  const roads = ROADS_BY_PHASE[phase];
  const road = roads[index % roads.length];
  const location = `${road}, DHA ${phase}`;

  let beds, baths;
  if (cat.type === 'HOUSE' || cat.type === 'PORTION') {
    beds = (index % 3) + 3; // 3, 4, 5 Beds
    baths = beds + (index % 2 === 0 ? 0 : 1);
  } else if (cat.type === 'APARTMENT') {
    beds = (index % 3) + 1; // 1, 2, 3 Beds
    baths = beds;
  } else if (cat.type === 'OFFICE') {
    baths = (index % 2) + 1;
  }

  let area = '500 Sq. Yd.';
  if (cat.type === 'HOUSE' || cat.type === 'PLOT') {
    const sizes = ['120 Sq. Yd.', '240 Sq. Yd.', '500 Sq. Yd.', '1000 Sq. Yd.'];
    area = sizes[index % sizes.length];
  } else if (cat.type === 'APARTMENT' || cat.type === 'PORTION') {
    const sizes = ['1200 Sq. Ft.', '1800 Sq. Ft.', '2400 Sq. Ft.'];
    area = sizes[index % sizes.length];
  } else {
    const sizes = ['450 Sq. Ft.', '900 Sq. Ft.', '2500 Sq. Ft.'];
    area = sizes[index % sizes.length];
  }

  let price = 50000000;
  if (cat.status === 'BUY') {
    if (cat.type === 'HOUSE') {
      if (area.includes('120')) price = 32000000 + (index % 5) * 2000000;
      else if (area.includes('240')) price = 55000000 + (index % 5) * 4000000;
      else price = 110000000 + (index % 5) * 8000000;
    } else if (cat.type === 'APARTMENT') {
      price = 16000000 + (index % 6) * 5000000;
    } else if (cat.type === 'PORTION') {
      price = 21000000 + (index % 5) * 3000000;
    } else if (cat.type === 'PLOT') {
      price = 15000000 + (index % 7) * 9000000;
    } else {
      price = 32000000 + (index % 8) * 12000000;
    }
  } else {
    // RENT Category prices
    if (cat.type === 'HOUSE') {
      price = 140000 + (index % 5) * 60000;
    } else if (cat.type === 'APARTMENT') {
      price = 50000 + (index % 6) * 20000;
    } else if (cat.type === 'PORTION') {
      price = 65000 + (index % 5) * 15000;
    } else if (cat.type === 'OFFICE') {
      price = 75000 + (index % 5) * 35000;
    } else {
      price = 110000 + (index % 6) * 75000;
    }
  }

  const stateLabel = cat.status === 'BUY' ? 'For Sale' : 'For Rent';
  const typeLabel = cat.type.charAt(0) + cat.type.slice(1).toLowerCase();
  const title = `Premium ${area} ${typeLabel} ${beds ? beds + ' Bed ' : ''}${stateLabel} in DHA ${phase}`;
  const description = `This premium luxury ${typeLabel.toLowerCase()} is perfectly situated in the core layout of ${location}. Built with absolute top-tier design aesthetics, premium high-gloss tiling, false ceilings, structured wiring, emergency backup grids, and dedicated water filters. Fully backed by standard DHA construction regulations.`;

  let baseImages = VILLA_IMAGES;
  if (cat.type === 'APARTMENT' || cat.type === 'PORTION') baseImages = APARTMENT_IMAGES;
  else if (cat.type === 'PLOT') baseImages = PLOT_IMAGES;
  else baseImages = COMMERCIAL_IMAGES;

  // Make sure at least 3 distinct images are selected
  const images = [
    baseImages[index % baseImages.length],
    baseImages[(index + 1) % baseImages.length],
    baseImages[(index + 2) % baseImages.length]
  ];

  const possessionStatuses = ['Ready', 'Under Construction', 'Off-Plan'];
  const furnishedStatuses = ['Furnished', 'Unfurnished', 'Semi-Furnished'];

  return {
    title,
    description,
    price,
    area,
    type: cat.type,
    status: cat.status,
    beds,
    baths,
    location,
    phase,
    possessionStatus: cat.type === 'PLOT' ? 'Off-Plan' : possessionStatuses[index % possessionStatuses.length],
    furnished: cat.type === 'PLOT' ? 'Unfurnished' : furnishedStatuses[index % furnishedStatuses.length],
    images,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    agent: agentId,
    isFeatured: index % 4 === 0,
    views: 15 + (index % 10) * 8,
    leadsCount: 0
  };
};

const seedDatabase = async (disconnectAfter = true) => {
  console.log('Checking required demo listing categories without deleting existing data...');
  return ensureDemoData(disconnectAfter);
};

const ensureDemoData = async (disconnectAfter = false) => {
  try {
    console.log('Running auto-recovery demo data checks...');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    }
    console.log(`Using database: "${mongoose.connection.name}"`);

    // 1. Ensure core users exist
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('agent123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const buyerPassword = await bcrypt.hash('buyer123', salt);

    let admin = await User.findOne({ email: 'admin@dhaestatepro.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin Controller',
        email: 'admin@dhaestatepro.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        phone: '+92 300 1234567',
        avatar: '/images/1535713875002-d1d0cf377fde.jpg'
      });
      console.log('Recovered missing Admin user.');
    }

    let agentSaad = await User.findOne({ email: 'saad.agent@dhaestatepro.com' });
    if (!agentSaad) {
      agentSaad = await User.create({
        name: 'Saad Fatani',
        email: 'saad.agent@dhaestatepro.com',
        passwordHash: defaultPassword,
        role: 'AGENT',
        phone: '+92 321 9876543',
        avatar: '/images/1560250097-0b93528c311a.jpg'
      });
      console.log('Recovered missing Agent Saad.');
    }

    let agentAli = await User.findOne({ email: 'ali.agent@dhaestatepro.com' });
    if (!agentAli) {
      agentAli = await User.create({
        name: 'Ali Tabani',
        email: 'ali.agent@dhaestatepro.com',
        passwordHash: defaultPassword,
        role: 'AGENT',
        phone: '+92 333 4567890',
        avatar: '/images/1472099645785-5658abf4ff4e.jpg'
      });
      console.log('Recovered missing Agent Ali.');
    }

    let agentZain = await User.findOne({ email: 'zain.agent@dhaestatepro.com' });
    if (!agentZain) {
      agentZain = await User.create({
        name: 'Zain Chaudhry',
        email: 'zain.agent@dhaestatepro.com',
        passwordHash: defaultPassword,
        role: 'AGENT',
        phone: '+92 312 8889999',
        avatar: '/images/1519085360753-af0119f7cbe7.jpg'
      });
      console.log('Recovered missing Agent Zain.');
    }

    let buyer = await User.findOne({ email: 'buyer@dhaestatepro.com' });
    if (!buyer) {
      buyer = await User.create({
        name: 'Raza Jafri',
        email: 'buyer@dhaestatepro.com',
        passwordHash: buyerPassword,
        role: 'USER',
        phone: '+92 345 5556666',
        avatar: '/images/1570295999919-56ceb5ecca61.jpg'
      });
      console.log('Recovered missing Buyer user.');
    }

    const agentsList = [agentSaad._id, agentAli._id, agentZain._id];

    // 2. Ensure Projects exist
    for (const proj of SEED_PROJECTS) {
      const exists = await Project.findOne({ title: proj.title });
      if (!exists) {
        await Project.create(proj);
        console.log(`Recovered missing Project: ${proj.title}`);
      }
    }

    // 3. Ensure Blogs exist
    for (const blog of SEED_BLOGS) {
      const exists = await Blog.findOne({ title: blog.title });
      if (!exists) {
        await Blog.create(blog);
        console.log(`Recovered missing Blog: ${blog.title}`);
      }
    }

    // 4. Ensure at least 8 Properties exist in each of the 10 core categories.
    let addedCount = 0;
    const propertiesToCreate = [];
    const categoryCounts = {};

    for (const cat of REQUIRED_CATEGORIES) {
      const count = await Property.countDocuments({ type: cat.type, status: cat.status });
      const categoryKey = `${cat.status} ${cat.type}`;
      categoryCounts[categoryKey] = count;

      if (count < 8) {
        const needed = 8 - count;
        console.log(`Category { type: ${cat.type}, status: ${cat.status} } has ${count} listings. Seeding ${needed} more to meet minimum 8 demo listings...`);

        for (let k = 0; k < needed; k++) {
          const agentId = agentsList[(k + addedCount) % agentsList.length];
          propertiesToCreate.push(createSampleProperty(cat, count + k, agentId));
          addedCount++;
        }

        categoryCounts[categoryKey] += needed;
      }
    }

    if (propertiesToCreate.length) {
      await Property.insertMany(propertiesToCreate);
    }

    // One-time migration: listings created before the verification
    // workflow existed were already public, so grandfather them as
    // Approved instead of hiding them as Pending.
    await Property.updateMany(
      { verificationStatus: { $exists: false } },
      { $set: { verificationStatus: 'Approved' } }
    );

    if (addedCount > 0) {
      console.log(`Auto-recovery completed. Seeded ${addedCount} missing properties successfully.`);
    } else {
      console.log('Database verification passed. 8+ properties exist in all categories.');
    }

    if (disconnectAfter) {
      await mongoose.disconnect();
    }

    return { addedCount, categoryCounts };
  } catch (error) {
    console.error('Error in ensureDemoData:', error);
    if (disconnectAfter && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    throw error;
  }
};

// Execute if run directly
if (require.main === module) {
  seedDatabase(true);
}

module.exports = {
  seedDatabase,
  ensureDemoData
};
