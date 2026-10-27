import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { SellerApplication } from '../models/SellerApplication.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/revnation';

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to database. Purging existing collections...');

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      SellerApplication.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seeder] Creating Users and Sellers...');

    // 1. Admin
    const admin = await User.create({
      name: 'RevNation Admin',
      email: process.env.ADMIN_EMAIL || 'admin@revnation.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      phone: '+91 98765 00001',
      role: 'ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    });

    // 2. Verified Sellers
    const sellerApex = await User.create({
      name: 'Vikram Mehta (Apex Tuning)',
      email: 'apex@revnation.com',
      password: 'Seller@12345',
      phone: '+91 98200 11223',
      role: 'SELLER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    });

    const sellerBavarian = await User.create({
      name: 'Rohan Sharma (Bavarian Customs)',
      email: 'bavarian@revnation.com',
      password: 'Seller@12345',
      phone: '+91 98111 33445',
      role: 'SELLER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    });

    const sellerBrembo = await User.create({
      name: 'Deepak Patel (Trackside India)',
      email: 'brembo@revnation.com',
      password: 'Seller@12345',
      phone: '+91 97333 55667',
      role: 'SELLER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80'
    });

    // 3. Normal Buyer with preloaded garage
    const buyer = await User.create({
      name: 'Kabir Malhotra',
      email: 'gearhead@revnation.com',
      password: 'User@12345',
      phone: '+91 99887 66554',
      role: 'USER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      addresses: [
        {
          fullName: 'Kabir Malhotra',
          phone: '+91 99887 66554',
          street: 'Flat 402, Skyline Residency, Golf Course Road',
          city: 'Gurugram',
          state: 'Haryana',
          postalCode: '122002',
          country: 'India',
          isDefault: true
        }
      ],
      vehicles: [
        {
          make: 'BMW',
          model: '3 Series',
          variant: '330i M-Sport',
          year: 2022,
          fuelType: 'Petrol',
          nickname: 'Project G20'
        },
        {
          make: 'Toyota',
          model: 'Fortuner',
          variant: '2.8 4x4 AT',
          year: 2020,
          fuelType: 'Diesel',
          nickname: 'The Tank'
        }
      ],
      activeVehicle: {
        make: 'BMW',
        model: '3 Series',
        variant: '330i M-Sport',
        year: 2022,
        fuelType: 'Petrol'
      }
    });

    // 4. User who submitted a seller application that is pending
    const prospectiveSeller = await User.create({
      name: 'Arjun Das (Velocity Motorsport)',
      email: 'velocity@revnation.com',
      password: 'User@12345',
      phone: '+91 98400 99881',
      role: 'USER',
      status: 'ACTIVE'
    });

    await SellerApplication.create({
      user: prospectiveSeller._id,
      businessName: 'Velocity Motorsport Dynamics',
      businessEmail: 'sales@velocitymotorsport.in',
      businessPhone: '+91 98400 99881',
      address: 'Plot 18, Auto Cluster Industrial Park, Pune, Maharashtra 411019',
      taxId: '27AAACV9821M1Z5',
      description: 'Specialized fabrication and performance import specialists with 8+ years experience in tarmac rally and circuit preparation.',
      categories: ['Exhaust Systems', 'Suspension & Chassis', 'Performance Tuning & Electronics'],
      status: 'PENDING'
    });

    // Also create records for approved seller applications
    await SellerApplication.create({
      user: sellerApex._id,
      businessName: 'Apex Performance Engineering',
      businessEmail: 'contact@apexperformance.in',
      businessPhone: '+91 98200 11223',
      address: 'Shop 4, Motor City, Andheri East, Mumbai 400069',
      taxId: '27AABCA1234F1Z8',
      description: 'Authorized importer of Garrett turbochargers, Eventuri intakes, and ECU remap systems.',
      categories: ['Engine Parts', 'Performance Tuning & Electronics'],
      status: 'APPROVED',
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });

    console.log('[Seeder] Creating Product Categories...');

    const categoriesData = [
      {
        name: 'Engine Parts',
        slug: 'engine-parts',
        description: 'Forged pistons, turbochargers, high-flow air intakes, intercoolers, and race cooling.',
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
        icon: 'Gauge',
        featured: true,
        subcategories: ['Turbochargers', 'Air Intakes', 'Intercoolers', 'Spark Plugs', 'Gaskets', 'Radiators']
      },
      {
        name: 'Exhaust Systems',
        slug: 'exhaust-systems',
        description: 'Titanium and stainless catback systems, downpipes, valvetronic mufflers, and race headers.',
        image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80',
        icon: 'Flame',
        featured: true,
        subcategories: ['Catback Exhausts', 'Downpipes', 'Valved Mufflers', 'Exhaust Tips', 'Race Headers']
      },
      {
        name: 'Brakes & Braking',
        slug: 'brakes',
        description: 'High-performance Big Brake Kits (BBK), slotted rotors, ceramic pads, and stainless braided lines.',
        image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800&auto=format&fit=crop&q=80',
        icon: 'Disc',
        featured: true,
        subcategories: ['Big Brake Kits', 'Ceramic Brake Pads', 'Slotted Rotors', 'Calipers', 'Braided Brake Lines']
      },
      {
        name: 'Suspension & Chassis',
        slug: 'suspension',
        description: 'Adjustable coilover kits, lowering springs, anti-roll sway bars, and front strut braces.',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
        icon: 'Sliders',
        featured: true,
        subcategories: ['Coilovers', 'Lowering Springs', 'Anti-Roll Bars', 'Strut Braces', 'Air Suspension']
      },
      {
        name: 'Wheels & Tyres',
        slug: 'wheels-and-tyres',
        description: 'Lightweight forged monoblocks, modular 3-piece rims, semi-slick track rubber, and wheel spacers.',
        image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
        icon: 'CircleDot',
        featured: true,
        subcategories: ['Forged Wheels', 'Alloy Wheels', 'Semi-Slick Tyres', 'Wheel Spacers', 'Titanium Lug Nuts']
      },
      {
        name: 'Exterior Styling & Aerodynamics',
        slug: 'exterior-styling',
        description: 'Pre-preg carbon fiber wings, front splitters, rear diffusers, side skirts, and widebody arches.',
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
        icon: 'Wind',
        featured: true,
        subcategories: ['Carbon GT Wings', 'Front Splitters', 'Rear Diffusers', 'Widebody Kits', 'Canards']
      },
      {
        name: 'Interior & Cockpit',
        slug: 'interior-cockpit',
        description: 'FIA approved bucket seats, Alcantara flat-bottom steering wheels, digital telemetry clusters, and harnesses.',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
        icon: 'Compass',
        featured: true,
        subcategories: ['Racing Seats', 'Steering Wheels', 'Short Shifters', 'Roll Cages', 'Shift Knobs']
      },
      {
        name: 'Lighting & Vision',
        slug: 'lighting',
        description: 'Custom laser projector assemblies, dynamic sequential LED tail lamps, and rally pod lights.',
        image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
        icon: 'Sun',
        featured: false,
        subcategories: ['Laser Headlights', 'Sequential Tail Lights', 'LED Pods', 'Underglow Kits', 'Projector Fog Lamps']
      },
      {
        name: 'Performance Tuning & Electronics',
        slug: 'performance-tuning',
        description: 'Plug-and-play stage tuning units, throttle booster modules, digital boost gauges, and standalone ECUs.',
        image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
        icon: 'Cpu',
        featured: true,
        subcategories: ['Stage 1/2 ECU Tuners', 'Throttle Controllers', 'Boost Controllers', 'OBD2 Diagnostics']
      }
    ];

    await Category.insertMany(categoriesData);

    console.log('[Seeder] Creating Automotive Products...');

    const productsData = [
      {
        seller: sellerBrembo._id,
        name: 'Brembo GT 6-Piston 380mm Monobloc Big Brake Kit',
        slug: 'brembo-gt-6-piston-380mm-monobloc-bbk',
        description: 'Engineered for extreme stopping power and zero brake fade on track and street. Features radial-mounted 6-piston monobloc aluminium calipers, 380x34mm two-piece cross-drilled floating discs with aluminium bells, and high-performance Brembo street/track compound pads.',
        category: 'Brakes & Braking',
        subcategory: 'Big Brake Kits',
        brand: 'Brembo',
        price: 245000,
        discountPrice: 228000,
        stock: 6,
        sku: 'BRM-GT6-380-RD',
        partNumber: '1N1.9002A',
        images: [
          'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Caliper Type', value: 'Radial 6-Piston Cast Monobloc' },
          { name: 'Rotor Size', value: '380mm x 34mm 2-Piece Floating' },
          { name: 'Finish', value: 'Gloss Racing Red Powdercoat' },
          { name: 'Brake Line', value: 'Goodridge Braided Stainless Steel' },
          { name: 'Fluid Included', value: 'Brembo HTC 64T Racing Fluid (500ml)' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '4 Series', variant: '430i Gran Coupe', yearStart: 2020, yearEnd: 2024 },
          { make: 'Audi', model: 'S4', variant: '3.0 TFSI Quattro', yearStart: 2018, yearEnd: 2023 }
        ],
        warranty: '2 Years Brembo Factory Warranty',
        returnPolicy: '14 Days Replacement Guarantee',
        status: 'APPROVED',
        isActive: true,
        badges: ['PERFORMANCE', 'BEST SELLER', 'TRACK READY'],
        rating: 4.9,
        reviewCount: 14,
        featured: true
      },
      {
        seller: sellerBavarian._id,
        name: 'Bilstein B16 PSS10 10-Way Adjustable Coilover Kit',
        slug: 'bilstein-b16-pss10-coilover-kit',
        description: 'The pinnacle of road and track suspension tuning. 10-stage parallel damping force adjustment by a single turn dial on the shock absorber. High-quality gas-pressure technology with inverted monotube design for optimal chassis response and stance lowering between 30mm and 50mm.',
        category: 'Suspension & Chassis',
        subcategory: 'Coilovers',
        brand: 'Bilstein',
        price: 185000,
        discountPrice: 172000,
        stock: 4,
        sku: 'BIL-48-265737',
        partNumber: '48-265737',
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Lowering Range', value: '30mm - 50mm Front & Rear' },
          { name: 'Damping', value: '10-Stage Rebound & Compression Dual Click' },
          { name: 'Surface Coating', value: 'Triple-C Technology Zinc Plating' },
          { name: 'Spring Type', value: 'Progressive High-Tensile Cold Wound' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2020, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: '320d', yearStart: 2019, yearEnd: 2024 },
          { make: 'Skoda', model: 'Octavia', variant: 'vRS 245', yearStart: 2018, yearEnd: 2023 }
        ],
        warranty: '3 Years Limited Bilstein Warranty',
        returnPolicy: '14 Days Return',
        status: 'APPROVED',
        isActive: true,
        badges: ['PERFORMANCE', 'OEM FIT'],
        rating: 4.8,
        reviewCount: 9,
        featured: true
      },
      {
        seller: sellerApex._id,
        name: 'Akrapovic Evolution Line Titanium Valved Exhaust System',
        slug: 'akrapovic-evolution-titanium-exhaust',
        description: 'Complete titanium exhaust system with dual carbon fiber tailpipes. Delivers an aggressive, resonant exhaust note under throttle while maintaining drone-free acoustic comfort at highway cruising. Features pneumatic vacuum-operated valves integrating directly with OEM drive modes (Comfort / Sport / Sport Plus).',
        category: 'Exhaust Systems',
        subcategory: 'Catback Exhausts',
        brand: 'Akrapovic',
        price: 365000,
        discountPrice: 345000,
        stock: 3,
        sku: 'AKR-EVO-TITAN-G20',
        partNumber: 'S-BM/T/8H',
        images: [
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Material', value: 'Ultra-Lightweight Proprietary Titanium' },
          { name: 'Weight Saving', value: '-8.4 kg compared to OEM exhaust' },
          { name: 'Power Gain', value: '+14.2 HP @ 5200 RPM' },
          { name: 'Torque Gain', value: '+19.6 Nm @ 3100 RPM' },
          { name: 'Exhaust Tips', value: 'Dual 100mm Handcrafted Matte Carbon Fiber' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2020, yearEnd: 2024 }
        ],
        warranty: '2 Years Manufacturer Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['PERFORMANCE', 'LIMITED STOCK'],
        rating: 5.0,
        reviewCount: 8,
        featured: true
      },
      {
        seller: sellerApex._id,
        name: 'Eventuri Carbon Fiber Cold Air Intake System (Gen 2)',
        slug: 'eventuri-carbon-fiber-cold-air-intake',
        description: 'Patented venturi housing provides laminar airflow straight to the turbo compressor wheel. Handcrafted pre-preg carbon fiber with custom CNC machined air mass sensor housing and inverted cone high-flow dry filter. Delivers crisp turbo spool sound and verified dyno gains.',
        category: 'Engine Parts',
        subcategory: 'Air Intakes',
        brand: 'Eventuri',
        price: 135000,
        discountPrice: 122000,
        stock: 5,
        sku: 'EVN-INTK-B48-CF',
        partNumber: 'EVE-G20-B48-CF',
        images: [
          'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Material', value: '100% Pre-Preg Carbon Fiber with UV Clearcoat' },
          { name: 'Airflow Increase', value: '+38% over factory airbox' },
          { name: 'Power Increase', value: '+12 WHP on standard tune' },
          { name: 'Filter Type', value: 'Dry High-Velocity Inverted Cone (Washable)' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '2 Series', variant: '220i Gran Coupe', yearStart: 2020, yearEnd: 2024 },
          { make: 'Toyota', model: 'Supra', variant: '2.0T B48', yearStart: 2020, yearEnd: 2024 }
        ],
        warranty: '1 Year Eventuri Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['PERFORMANCE', 'BEST SELLER'],
        rating: 4.9,
        reviewCount: 11,
        featured: true
      },
      {
        seller: sellerBavarian._id,
        name: 'BBS LM 19-inch 2-Piece Forged Wheel Set (Diamond Black)',
        slug: 'bbs-lm-19-inch-2-piece-forged-wheel-set',
        description: 'The definitive Motorsport icon. Classic cross-spoke styling forged from aerospace-grade alloy with spun cast barrel and titanium assembly bolts. Lightweight, incredibly strong, and tested rigorously on the Nürburgring Nordschleife.',
        category: 'Wheels & Tyres',
        subcategory: 'Forged Wheels',
        brand: 'BBS',
        price: 395000,
        discountPrice: 375000,
        stock: 2,
        sku: 'BBS-LM-19-5x112',
        partNumber: 'LM436-DBK',
        images: [
          'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Size', value: '19 x 8.5J Front / 19 x 9.5J Rear' },
          { name: 'Bolt Pattern (PCD)', value: '5 x 112' },
          { name: 'Offset', value: 'ET32 Front / ET38 Rear' },
          { name: 'Construction', value: 'Forged Center, Spun Rim Section, Titanium Fasteners' },
          { name: 'Finish', value: 'Diamond Black Center with Polished Diamond Cut Lip' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2020, yearEnd: 2024 },
          { make: 'Audi', model: 'A4', variant: '40 TFSI', yearStart: 2018, yearEnd: 2024 },
          { make: 'Volkswagen', model: 'Golf', variant: 'GTI Mk7/Mk8', yearStart: 2015, yearEnd: 2024 }
        ],
        warranty: '5 Years BBS Structural Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['BEST SELLER', 'LIMITED STOCK'],
        rating: 5.0,
        reviewCount: 6,
        featured: true
      },
      {
        seller: sellerBavarian._id,
        name: 'Vorsteiner VRS Carbon Fiber Front Lip Spoiler & Rear Diffuser Kit',
        slug: 'vorsteiner-vrs-carbon-aerodynamic-kit',
        description: 'Autoclaved aerospace pre-preg carbon fiber aerodynamic package designed specifically for aggressive front downforce and clean underbody air evacuation. Retains factory ground clearance on driveways while giving the vehicle a menacing presence.',
        category: 'Exterior Styling & Aerodynamics',
        subcategory: 'Front Splitters',
        brand: 'Vorsteiner',
        price: 155000,
        discountPrice: 142000,
        stock: 5,
        sku: 'VOR-VRS-G20-CF',
        partNumber: 'VRS-BM-G20-AERO',
        images: [
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Weave', value: '2x2 Twill High-Gloss Pre-Preg Carbon Fiber' },
          { name: 'Fitment', value: 'Direct OEM Bolt-on (No Drilling Required)' },
          { name: 'UV Protection', value: 'Ceramic Nano UV Resistant Clearcoat' },
          { name: 'Downforce', value: 'Approx. 24kg @ 140 km/h' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2020, yearEnd: 2024 }
        ],
        warranty: '2 Years Workmanship Warranty',
        returnPolicy: '14 Days Return',
        status: 'APPROVED',
        isActive: true,
        badges: ['PERFORMANCE', 'OEM FIT'],
        rating: 4.7,
        reviewCount: 5,
        featured: false
      },
      {
        seller: sellerApex._id,
        name: 'Burger Motorsports JB4 Stage 2 Piggyback ECU Tuner + Bluetooth Kit',
        slug: 'burger-motorsports-jb4-stage-2-tuner',
        description: 'The gold standard in safe, undetectable plug-and-play performance tuning. Connects between engine sensors and DME to alter boost maps, fuel rail pressure, and ignition timing. Includes wireless smartphone app connectivity for real-time digital gauges, data logging, and map switching on the fly.',
        category: 'Performance Tuning & Electronics',
        subcategory: 'Stage 1/2 ECU Tuners',
        brand: 'Burger Motorsports',
        price: 78000,
        discountPrice: 69900,
        stock: 12,
        sku: 'BMS-JB4-B48-BT',
        partNumber: 'JB4-BMW-GEN3',
        images: [
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Power Increase', value: '+45 HP & +70 Nm Torque on 95 Octane fuel' },
          { name: 'Maps Included', value: 'Map 1 (Daily), Map 2 (97+ Octane), Map 5 (Auto-Tuning)' },
          { name: 'Connectivity', value: 'Bluetooth 5.0 Wireless iOS & Android App' },
          { name: 'Installation', value: 'Plug & Play harness with OEM AMP connectors' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2020, yearEnd: 2024 },
          { make: 'Toyota', model: 'Supra', variant: '3.0T / 2.0T', yearStart: 2020, yearEnd: 2024 }
        ],
        warranty: '1 Year BMS Hardware Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['DEAL', 'BEST SELLER'],
        rating: 4.9,
        reviewCount: 22,
        featured: true
      },
      {
        seller: sellerBrembo._id,
        name: 'Old Man Emu BP-51 High Performance Bypass Suspension Kit',
        slug: 'old-man-emu-bp-51-bypass-suspension-fortuner',
        description: 'Internal bypass 51mm shock absorber system developed for heavy-duty overland touring and corrugated off-road terrain. Provides both velocity-sensitive and position-sensitive damping to soak up brutal impacts while keeping high-speed highway body roll controlled.',
        category: 'Suspension & Chassis',
        subcategory: 'Coilovers',
        brand: 'ARB Old Man Emu',
        price: 285000,
        discountPrice: 269000,
        stock: 3,
        sku: 'OME-BP51-FORTUNER-20',
        partNumber: 'BP51-TOY-04',
        images: [
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Body Diameter', value: '51mm 6061 T6 Hard Anodized Aluminium' },
          { name: 'Lift Height', value: '+50mm (2-inch Lift)' },
          { name: 'Adjustability', value: 'Independent Rebound and Compression Clickers' },
          { name: 'Reservoir', value: 'Remote Aluminium Reservoir with Braided Hose' }
        ],
        compatibility: [
          { make: 'Toyota', model: 'Fortuner', variant: '2.8 4x4 AT', yearStart: 2016, yearEnd: 2024 },
          { make: 'Toyota', model: 'Fortuner', variant: 'Legender 4x4', yearStart: 2021, yearEnd: 2024 },
          { make: 'Toyota', model: 'Hilux', variant: '4x4 Double Cab', yearStart: 2018, yearEnd: 2024 }
        ],
        warranty: '3 Years / 60,000 KM Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['PERFORMANCE', 'OEM FIT'],
        rating: 4.8,
        reviewCount: 7,
        featured: true
      },
      {
        seller: sellerBrembo._id,
        name: 'Borla Touring Cat-Back Stainless Performance Exhaust System',
        slug: 'borla-touring-catback-toyota-fortuner',
        description: 'T-304 austenitic stainless steel exhaust built to unlock engine response and deliver a deep, throaty diesel exhaust rumble without interior cabin resonance. Mandrel-bent piping ensures smooth exhaust velocity under load and towing.',
        category: 'Exhaust Systems',
        subcategory: 'Catback Exhausts',
        brand: 'Borla',
        price: 92000,
        discountPrice: 85000,
        stock: 5,
        sku: 'BOR-140788',
        partNumber: '140788',
        images: [
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Material', value: 'T-304 Aircraft Grade Stainless Steel' },
          { name: 'Pipe Diameter', value: '3.0 inch Mandrel-Bent' },
          { name: 'Tip Finish', value: 'Single 4.0-inch Angle-Cut Polished Chrome' }
        ],
        compatibility: [
          { make: 'Toyota', model: 'Fortuner', variant: '2.8 4x4 AT', yearStart: 2016, yearEnd: 2024 },
          { make: 'Toyota', model: 'Fortuner', variant: 'Legender 4x4', yearStart: 2021, yearEnd: 2024 }
        ],
        warranty: '1 Million Mile Million-Mile Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['OEM FIT'],
        rating: 4.7,
        reviewCount: 4,
        featured: false
      },
      {
        seller: sellerBavarian._id,
        name: 'Sparco QRT-R FIA 8855-1999 Ultralight Composite Bucket Seat',
        slug: 'sparco-qrt-r-fia-composite-bucket-seat',
        description: 'Constructed using Sparco’s patented QRT (Quick Resin Technology) process that reduces seat shell weight by up to 30% compared to traditional fiberglass seats. Non-slip fabric on the shoulder bolsters and base keeps driver securely planted during high-g cornering.',
        category: 'Interior & Cockpit',
        subcategory: 'Racing Seats',
        brand: 'Sparco',
        price: 74000,
        discountPrice: 68000,
        stock: 6,
        sku: 'SPA-008012RNR',
        partNumber: '008012RNR',
        images: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Weight', value: '7.1 kg (Shell only)' },
          { name: 'Homologation', value: 'FIA 8855-1999 Certified' },
          { name: 'Harness Slots', value: '5 Large Openings for 4/5/6-Point Harnesses' },
          { name: 'Side Mounts', value: 'Standard 290mm Lateral Mount Spacing' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: 'All Variants', yearStart: 2015, yearEnd: 2024 },
          { make: 'Honda', model: 'Civic', variant: 'Type R / VTEC', yearStart: 2016, yearEnd: 2024 },
          { make: 'Volkswagen', model: 'Polo', variant: 'GT TSI / GTI', yearStart: 2014, yearEnd: 2024 },
          { make: 'Skoda', model: 'Octavia', variant: 'vRS', yearStart: 2017, yearEnd: 2024 }
        ],
        warranty: '2 Years Manufacturer Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['TRACK READY', 'PERFORMANCE'],
        rating: 4.9,
        reviewCount: 10,
        featured: false
      },
      {
        seller: sellerBavarian._id,
        name: 'M Performance Custom Alcantara LED Steering Wheel with Shift Lights',
        slug: 'm-performance-alcantara-led-steering-wheel',
        description: 'Wrapped in genuine Italian Alcantara with M-tricolour stitching. Embedded OLED display at the top rim shows engine RPM, oil/coolant temperatures, 0-100 km/h sprint timer, and lateral/longitudinal G-meter, accompanied by 10-segment multicolored LED shift lights.',
        category: 'Interior & Cockpit',
        subcategory: 'Steering Wheels',
        brand: 'M Performance',
        price: 110000,
        discountPrice: 99000,
        stock: 4,
        sku: 'MP-LED-G20-SW',
        partNumber: '32302455278',
        images: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Material', value: 'High-Grip Charcoal Alcantara with Carbon Insert' },
          { name: 'Display', value: 'Monochrome High-Contrast OLED Screen' },
          { name: 'Telemetry', value: 'Shift Indicator LEDs, Lap Timer, Water/Oil Temp' },
          { name: 'Airbag Compatibility', value: 'Reuses OEM M-Sport Airbag & Steering Controls' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2020, yearEnd: 2024 },
          { make: 'BMW', model: '2 Series', variant: '220i M-Sport', yearStart: 2021, yearEnd: 2024 }
        ],
        warranty: '2 Years Manufacturer Warranty',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['PERFORMANCE', 'OEM FIT'],
        rating: 5.0,
        reviewCount: 15,
        featured: true
      },
      {
        seller: sellerBavarian._id,
        name: 'Osram LEDriving Dynamic Mirror Indicators & Laser DRL Assembly',
        slug: 'osram-ledriving-dynamic-indicators-drl',
        description: 'Transform your front turn indicators with sleek synchronous sequential sweep lighting. Plug-and-play installation into existing mirror housings with zero coding, error-free on CAN-bus with ECE approval.',
        category: 'Lighting & Vision',
        subcategory: 'Laser Headlights',
        brand: 'Osram',
        price: 24500,
        discountPrice: 19999,
        stock: 14,
        sku: 'OSR-DYN-G20-IND',
        partNumber: 'LEDDMI 5G0 WT S',
        images: [
          'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80'
        ],
        specifications: [
          { name: 'Lighting Type', value: 'Dynamic High-Output Amber LEDs' },
          { name: 'Lens', value: 'Smoked UV-Treated Polycarbonate' },
          { name: 'Certification', value: 'ECE R6/R10 Homologated' },
          { name: 'Lifespan', value: 'Up to 5000 Operating Hours' }
        ],
        compatibility: [
          { make: 'BMW', model: '3 Series', variant: '330i M-Sport', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: '320d', yearStart: 2019, yearEnd: 2024 },
          { make: 'BMW', model: '3 Series', variant: 'M340i xDrive', yearStart: 2020, yearEnd: 2024 }
        ],
        warranty: '5 Years Osram Guarantee',
        returnPolicy: '14 Days Replacement',
        status: 'APPROVED',
        isActive: true,
        badges: ['DEAL', 'OEM FIT'],
        rating: 4.8,
        reviewCount: 18,
        featured: false
      }
    ];

    const insertedProducts = await Product.insertMany(productsData);

    console.log('[Seeder] Creating Past Orders & Reviews...');

    // Kabir Malhotra purchased the Brembo Big Brake Kit previously
    const bremboProduct = insertedProducts.find(p => p.sku === 'BRM-GT6-380-RD');
    const airIntakeProduct = insertedProducts.find(p => p.sku === 'EVN-INTK-B48-CF');

    const pastOrder = await Order.create({
      orderNumber: 'RN-20260915-8421',
      user: buyer._id,
      items: [
        {
          product: bremboProduct._id,
          seller: sellerBrembo._id,
          name: bremboProduct.name,
          brand: bremboProduct.brand,
          price: bremboProduct.discountPrice || bremboProduct.price,
          quantity: 1,
          image: bremboProduct.images[0],
          partNumber: bremboProduct.partNumber
        }
      ],
      shippingAddress: buyer.addresses[0],
      subtotal: 228000,
      discount: 0,
      shippingCost: 0,
      total: 228000,
      paymentMethod: 'TEST_MODE_CARD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      trackingNumber: 'BLUEDART-EXP-992182736',
      timeline: [
        { status: 'CONFIRMED', comment: 'Order verified and payment confirmed', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
        { status: 'PROCESSING', comment: 'Packaging with shock-dampened crate', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        { status: 'SHIPPED', comment: 'Dispatched via BlueDart Express Air', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
        { status: 'OUT_FOR_DELIVERY', comment: 'Out with delivery courier in Gurugram', timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000) },
        { status: 'DELIVERED', comment: 'Delivered and signed by recipient', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      ],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    });

    // Create verified review for the Brembo product
    await Review.create({
      user: buyer._id,
      product: bremboProduct._id,
      order: pastOrder._id,
      rating: 5,
      title: 'Monstrous braking power on Buddh International Circuit!',
      comment: 'Fitted this kit on my 2022 BMW 330i before a track weekend. The initial bite is razor sharp without being grabby in city traffic. Lap after lap with zero brake fade or fluid boil. 100% genuine Brembo parts with certification card.',
      status: 'APPROVED',
      verifiedPurchase: true
    });

    // Notification for the buyer
    await Notification.create({
      user: buyer._id,
      title: 'Order Delivered Successfully',
      message: `Your order #${pastOrder.orderNumber} for ${bremboProduct.name} was delivered. Enjoy your drive!`,
      type: 'ORDER',
      link: `/orders/${pastOrder._id}`
    });

    console.log('[Seeder] Database seeding completed successfully!');
    console.log('---------------------------------------------------------');
    console.log('CREDENTIALS (Development Testing):');
    console.log('ADMIN:  admin@revnation.com    / Admin@12345');
    console.log('SELLER: apex@revnation.com     / Seller@12345');
    console.log('SELLER: bavarian@revnation.com / Seller@12345');
    console.log('USER:   gearhead@revnation.com / User@12345 (Preloaded 2022 BMW 330i in garage)');
    console.log('APPLICANT (Pending Seller): velocity@revnation.com / User@12345');
    console.log('---------------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
