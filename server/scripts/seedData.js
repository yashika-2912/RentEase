require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Property = require('../src/models/Property');
const Lease = require('../src/models/Lease');
const Payment = require('../src/models/Payment');
const MaintenanceRequest = require('../src/models/MaintenanceRequest');
const Message = require('../src/models/Message');
const Notification = require('../src/models/Notification');

const { connectDB } = require('../src/config/db');

const PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
];

const seed = async () => {
    await connectDB();
    console.log('🌱 Starting seed...');

    await Promise.all([
        User.deleteMany({}),
        Property.deleteMany({}),
        Lease.deleteMany({}),
        Payment.deleteMany({}),
        MaintenanceRequest.deleteMany({}),
        Message.deleteMany({}),
        Notification.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    const seededPassword = 'password123';

    const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@rentease.com',
        password: seededPassword,
        phone: '+91-9000000001',
        role: 'admin',
        isVerified: true,
        isActive: true,
    });

    const landlords = [];
    for (const landlord of [
        {
            name: 'Rajesh Kumar',
            email: 'rajesh@rentease.com',
            password: seededPassword,
            phone: '+91-9811234567',
            role: 'landlord',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
        },
        {
            name: 'Priya Sharma',
            email: 'priya@rentease.com',
            password: seededPassword,
            phone: '+91-9822345678',
            role: 'landlord',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        },
        {
            name: 'Amit Patel',
            email: 'amit@rentease.com',
            password: seededPassword,
            phone: '+91-9833456789',
            role: 'landlord',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
        },
    ]) {
        landlords.push(await User.create(landlord));
    }

    const tenants = [];
    for (const tenant of [
        {
            name: 'Aisha Nair',
            email: 'aisha@rentease.com',
            password: seededPassword,
            phone: '+91-9844567890',
            role: 'tenant',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
            preferences: {
                budget: { min: 10000, max: 30000 },
                preferredLocations: ['Mumbai', 'Pune'],
                bedrooms: 2,
                amenities: ['Parking', 'Gym', 'WiFi'],
                furnished: true,
            },
        },
        {
            name: 'Rohan Mehta',
            email: 'rohan@rentease.com',
            password: seededPassword,
            phone: '+91-9855678901',
            role: 'tenant',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohan',
            preferences: {
                budget: { min: 8000, max: 20000 },
                preferredLocations: ['Bangalore', 'Chennai'],
                bedrooms: 1,
                amenities: ['WiFi', 'AC', 'Security'],
                furnished: false,
            },
        },
        {
            name: 'Sneha Reddy',
            email: 'sneha@rentease.com',
            password: seededPassword,
            phone: '+91-9866789012',
            role: 'tenant',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
            preferences: {
                budget: { min: 15000, max: 40000 },
                preferredLocations: ['Hyderabad', 'Pune'],
                bedrooms: 2,
                amenities: ['Parking', 'AC', 'Pet-Friendly'],
                furnished: true,
            },
        },
        {
            name: 'Vikram Singh',
            email: 'vikram@rentease.com',
            password: seededPassword,
            phone: '+91-9877890123',
            role: 'tenant',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
            preferences: {
                budget: { min: 20000, max: 60000 },
                preferredLocations: ['Delhi', 'Gurgaon'],
                bedrooms: 3,
                amenities: ['Parking', 'Gym', 'Pool', 'Security'],
                furnished: true,
            },
        },
        {
            name: 'Kavya Iyer',
            email: 'kavya@rentease.com',
            password: seededPassword,
            phone: '+91-9888901234',
            role: 'tenant',
            isVerified: true,
            isActive: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kavya',
            preferences: {
                budget: { min: 5000, max: 15000 },
                preferredLocations: ['Chennai', 'Coimbatore'],
                bedrooms: 1,
                amenities: ['WiFi', 'Power Backup'],
                furnished: false,
            },
        },
    ]) {
        tenants.push(await User.create(tenant));
    }

    console.log(`✅ Created ${1 + landlords.length + tenants.length} users`);

    const propertyData = [
        {
            landlord: landlords[0]._id,
            title: 'Spacious 2BHK in Bandra West',
            description: 'Beautiful fully furnished 2BHK apartment in the heart of Bandra with stunning sea view, modern amenities and 24/7 security.',
            type: 'apartment',
            rent: 28000,
            deposit: 56000,
            availableFrom: new Date('2024-01-01'),
            address: {
                street: '14, Sea Breeze Society, Linking Road',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400050',
                coordinates: { lat: 19.0596, lng: 72.8295 },
            },
            bedrooms: 2,
            bathrooms: 2,
            area: 950,
            amenities: ['Parking', 'Gym', 'WiFi', 'AC', 'Security', 'Power Backup'],
            furnished: true,
            images: [PROPERTY_IMAGES[0], PROPERTY_IMAGES[1]],
            isAvailable: false,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.5,
        },
        {
            landlord: landlords[0]._id,
            title: 'Cozy Studio in Koramangala',
            description: 'Compact and well-maintained studio apartment in Koramangala, ideal for IT professionals. Close to tech parks.',
            type: 'studio',
            rent: 14000,
            deposit: 28000,
            availableFrom: new Date('2024-02-01'),
            address: {
                street: '5th Block, Koramangala',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560034',
                coordinates: { lat: 12.9279, lng: 77.6271 },
            },
            bedrooms: 0,
            bathrooms: 1,
            area: 420,
            amenities: ['WiFi', 'AC', 'Security', 'Power Backup'],
            furnished: true,
            images: [PROPERTY_IMAGES[2]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.2,
        },
        {
            landlord: landlords[0]._id,
            title: 'Premium 3BHK Villa in Whitefield',
            description: 'Luxurious 3BHK independent villa in Whitefield with private garden, modular kitchen, and premium fittings.',
            type: 'villa',
            rent: 55000,
            deposit: 165000,
            availableFrom: new Date('2024-03-01'),
            address: {
                street: 'EPIP Zone, Whitefield',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560066',
                coordinates: { lat: 12.9698, lng: 77.7499 },
            },
            bedrooms: 3,
            bathrooms: 3,
            area: 2200,
            amenities: ['Parking', 'Gym', 'Pool', 'WiFi', 'AC', 'Security', 'Pet-Friendly'],
            furnished: true,
            images: [PROPERTY_IMAGES[5], PROPERTY_IMAGES[6]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.8,
        },
        {
            landlord: landlords[1]._id,
            title: '1BHK in Powai Near Hiranandani',
            description: 'Well-connected 1BHK flat near Hiranandani Gardens, Powai. Walking distance to malls, restaurants and IT offices.',
            type: 'apartment',
            rent: 22000,
            deposit: 44000,
            availableFrom: new Date('2024-01-15'),
            address: {
                street: 'Hiranandani Gardens, Powai',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400076',
                coordinates: { lat: 19.1175, lng: 72.9060 },
            },
            bedrooms: 1,
            bathrooms: 1,
            area: 620,
            amenities: ['Parking', 'WiFi', 'AC', 'Security', 'Gym'],
            furnished: true,
            images: [PROPERTY_IMAGES[3]],
            isAvailable: false,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.3,
        },
        {
            landlord: landlords[1]._id,
            title: 'Affordable PG in HSR Layout',
            description: 'Fully furnished PG accommodation in HSR Layout with home-cooked meals, high-speed WiFi, and a vibrant community.',
            type: 'pg',
            rent: 8500,
            deposit: 17000,
            availableFrom: new Date('2024-02-01'),
            address: {
                street: 'Sector 4, HSR Layout',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560102',
                coordinates: { lat: 12.9116, lng: 77.6474 },
            },
            bedrooms: 1,
            bathrooms: 1,
            area: 200,
            amenities: ['WiFi', 'AC', 'Security', 'Power Backup'],
            furnished: true,
            images: [PROPERTY_IMAGES[4]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 3.9,
        },
        {
            landlord: landlords[1]._id,
            title: '2BHK in Jubilee Hills',
            description: 'Elegant 2BHK semi-furnished apartment in the posh Jubilee Hills locality with excellent connectivity.',
            type: 'apartment',
            rent: 32000,
            deposit: 96000,
            availableFrom: new Date('2024-03-01'),
            address: {
                street: 'Road No. 36, Jubilee Hills',
                city: 'Hyderabad',
                state: 'Telangana',
                pincode: '500033',
                coordinates: { lat: 17.4325, lng: 78.4100 },
            },
            bedrooms: 2,
            bathrooms: 2,
            area: 1100,
            amenities: ['Parking', 'AC', 'Security', 'Power Backup', 'Pet-Friendly'],
            furnished: false,
            images: [PROPERTY_IMAGES[7], PROPERTY_IMAGES[0]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.4,
        },
        {
            landlord: landlords[2]._id,
            title: '3BHK Independent House in Adyar',
            description: 'Spacious independent house in the serene Adyar neighbourhood, ideal for families. Close to schools and hospitals.',
            type: 'house',
            rent: 35000,
            deposit: 105000,
            availableFrom: new Date('2024-02-15'),
            address: {
                street: '12, Gandhi Nagar, Adyar',
                city: 'Chennai',
                state: 'Tamil Nadu',
                pincode: '600020',
                coordinates: { lat: 13.0012, lng: 80.2565 },
            },
            bedrooms: 3,
            bathrooms: 2,
            area: 1800,
            amenities: ['Parking', 'Security', 'Power Backup', 'Pet-Friendly'],
            furnished: false,
            images: [PROPERTY_IMAGES[1], PROPERTY_IMAGES[2]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.1,
        },
        {
            landlord: landlords[2]._id,
            title: 'Modern 1BHK in Sector 56 Gurgaon',
            description: 'Smart home enabled 1BHK in Gurgaon\'s Sector 56 with automated lighting, AC and app-controlled security.',
            type: 'apartment',
            rent: 18000,
            deposit: 36000,
            availableFrom: new Date('2024-01-10'),
            address: {
                street: 'DLF Phase 5, Sector 56',
                city: 'Gurgaon',
                state: 'Haryana',
                pincode: '122011',
                coordinates: { lat: 28.4089, lng: 77.0422 },
            },
            bedrooms: 1,
            bathrooms: 1,
            area: 680,
            amenities: ['Parking', 'Gym', 'WiFi', 'AC', 'Security'],
            furnished: true,
            images: [PROPERTY_IMAGES[3], PROPERTY_IMAGES[4]],
            isAvailable: false,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.6,
        },
        {
            landlord: landlords[2]._id,
            title: '2BHK in Viman Nagar, Pune',
            description: 'Bright and airy 2BHK apartment in Viman Nagar close to Airport and IT parks. Perfect for working professionals.',
            type: 'apartment',
            rent: 21000,
            deposit: 42000,
            availableFrom: new Date('2024-03-15'),
            address: {
                street: 'Clover Park, Viman Nagar',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411014',
                coordinates: { lat: 18.5679, lng: 73.9143 },
            },
            bedrooms: 2,
            bathrooms: 1,
            area: 900,
            amenities: ['Parking', 'WiFi', 'AC', 'Power Backup'],
            furnished: true,
            images: [PROPERTY_IMAGES[5]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 4.0,
        },
        {
            landlord: landlords[0]._id,
            title: 'Luxury 4BHK Penthouse in South Delhi',
            description: 'Breathtaking penthouse with panoramic city views, rooftop terrace, home theatre, and premium concierge services.',
            type: 'apartment',
            rent: 120000,
            deposit: 360000,
            availableFrom: new Date('2024-04-01'),
            address: {
                street: 'GK-2, Greater Kailash',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110048',
                coordinates: { lat: 28.5355, lng: 77.2431 },
            },
            bedrooms: 4,
            bathrooms: 4,
            area: 3500,
            amenities: ['Parking', 'Gym', 'Pool', 'WiFi', 'AC', 'Security', 'Power Backup'],
            furnished: true,
            images: [PROPERTY_IMAGES[6], PROPERTY_IMAGES[7]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 5.0,
        },
        {
            landlord: landlords[1]._id,
            title: '1BHK in T. Nagar, Chennai',
            description: 'Convenient 1BHK in the bustling T. Nagar shopping district. Close to metro, markets and restaurants.',
            type: 'apartment',
            rent: 13000,
            deposit: 26000,
            availableFrom: new Date('2024-02-01'),
            address: {
                street: 'Usman Road, T. Nagar',
                city: 'Chennai',
                state: 'Tamil Nadu',
                pincode: '600017',
                coordinates: { lat: 13.0418, lng: 80.2341 },
            },
            bedrooms: 1,
            bathrooms: 1,
            area: 560,
            amenities: ['WiFi', 'Security', 'Power Backup'],
            furnished: false,
            images: [PROPERTY_IMAGES[0]],
            isAvailable: true,
            isApproved: true,
            approvalStatus: 'approved',
            rating: 3.8,
        },
        {
            landlord: landlords[2]._id,
            title: 'Pending Approval: New Listing in Noida',
            description: '2BHK apartment in Noida Sector 62 awaiting admin approval. Great connectivity via metro.',
            type: 'apartment',
            rent: 19000,
            deposit: 38000,
            availableFrom: new Date('2024-05-01'),
            address: {
                street: 'Sector 62, Noida',
                city: 'Noida',
                state: 'Uttar Pradesh',
                pincode: '201309',
                coordinates: { lat: 28.6272, lng: 77.3660 },
            },
            bedrooms: 2,
            bathrooms: 1,
            area: 850,
            amenities: ['Parking', 'WiFi', 'AC'],
            furnished: false,
            images: [PROPERTY_IMAGES[1]],
            isAvailable: true,
            isApproved: false,
            approvalStatus: 'pending',
            rating: 0,
        },
    ];

    const properties = await Property.insertMany(propertyData);
    console.log(`✅ Created ${properties.length} properties`);

    const leaseData = [
        {
            property: properties[0]._id,
            tenant: tenants[0]._id,
            landlord: landlords[0]._id,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            monthlyRent: 28000,
            deposit: 56000,
            status: 'active',
            documents: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
        },
        {
            property: properties[3]._id,
            tenant: tenants[1]._id,
            landlord: landlords[1]._id,
            startDate: new Date('2024-02-01'),
            endDate: new Date('2025-01-31'),
            monthlyRent: 22000,
            deposit: 44000,
            status: 'active',
        },
        {
            property: properties[7]._id,
            tenant: tenants[3]._id,
            landlord: landlords[2]._id,
            startDate: new Date('2024-01-10'),
            endDate: new Date('2025-01-09'),
            monthlyRent: 18000,
            deposit: 36000,
            status: 'active',
        },
        {
            property: properties[1]._id,
            tenant: tenants[4]._id,
            landlord: landlords[0]._id,
            startDate: new Date('2023-06-01'),
            endDate: new Date('2024-05-31'),
            monthlyRent: 14000,
            deposit: 28000,
            status: 'expired',
        },
        {
            property: properties[2]._id,
            tenant: tenants[2]._id,
            landlord: landlords[0]._id,
            startDate: new Date('2024-03-01'),
            endDate: new Date('2025-02-28'),
            monthlyRent: 55000,
            deposit: 165000,
            status: 'pending',
        },
    ];

    const leases = await Lease.insertMany(leaseData);
    console.log(`✅ Created ${leases.length} leases`);

    const now = new Date();
    const paymentData = [];
    for (let i = 0; i < 6; i++) {
        const month = ((now.getMonth() - i + 12) % 12) + 1;
        const year = i > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
        paymentData.push({
            lease: leases[0]._id,
            tenant: tenants[0]._id,
            landlord: landlords[0]._id,
            property: properties[0]._id,
            amount: 28000,
            month,
            year,
            status: i > 0 ? 'paid' : 'pending',
            dueDate: new Date(year, month - 1, 5),
            paidAt: i > 0 ? new Date(year, month - 1, 3) : null,
        });
    }
    for (let i = 0; i < 4; i++) {
        const month = ((now.getMonth() - i + 12) % 12) + 1;
        const year = i > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
        paymentData.push({
            lease: leases[1]._id,
            tenant: tenants[1]._id,
            landlord: landlords[1]._id,
            property: properties[3]._id,
            amount: 22000,
            month,
            year,
            status: i > 0 ? 'paid' : 'overdue',
            dueDate: new Date(year, month - 1, 5),
            paidAt: i > 0 ? new Date(year, month - 1, 4) : null,
        });
    }
    for (let i = 0; i < 3; i++) {
        const month = ((now.getMonth() - i + 12) % 12) + 1;
        const year = i > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
        paymentData.push({
            lease: leases[2]._id,
            tenant: tenants[3]._id,
            landlord: landlords[2]._id,
            property: properties[7]._id,
            amount: 18000,
            month,
            year,
            status: 'paid',
            dueDate: new Date(year, month - 1, 5),
            paidAt: new Date(year, month - 1, 2),
        });
    }

    const payments = await Payment.insertMany(paymentData);
    console.log(`✅ Created ${payments.length} payment records`);

    const maintenanceData = [
        {
            property: properties[0]._id,
            tenant: tenants[0]._id,
            landlord: landlords[0]._id,
            title: 'Leaking Tap in Bathroom',
            description: 'The hot water tap in the master bathroom has been leaking for 3 days. Water is dripping constantly.',
            category: 'plumbing',
            priority: 'high',
            status: 'in-progress',
            internalNotes: 'Plumber scheduled for tomorrow.',
        },
        {
            property: properties[0]._id,
            tenant: tenants[0]._id,
            landlord: landlords[0]._id,
            title: 'AC Not Cooling Properly',
            description: 'The bedroom AC is not cooling below 26°C even on max setting. It was working fine until last week.',
            category: 'appliance',
            priority: 'medium',
            status: 'open',
        },
        {
            property: properties[3]._id,
            tenant: tenants[1]._id,
            landlord: landlords[1]._id,
            title: 'Power Outage in Kitchen',
            description: 'Frequently tripping circuit breaker in the kitchen. All kitchen appliances stop working.',
            category: 'electrical',
            priority: 'urgent',
            status: 'resolved',
            resolvedAt: new Date(),
            internalNotes: 'Electrician replaced faulty breaker on 15th.',
        },
        {
            property: properties[7]._id,
            tenant: tenants[3]._id,
            landlord: landlords[2]._id,
            title: 'Crack in Living Room Wall',
            description: 'There is a visible crack running vertically on the east wall of the living room, about 2 feet long.',
            category: 'structural',
            priority: 'high',
            status: 'open',
        },
        {
            property: properties[3]._id,
            tenant: tenants[1]._id,
            landlord: landlords[1]._id,
            title: 'Washing Machine Stopped Working',
            description: 'The top load washing machine does not start. It shows E3 error on display.',
            category: 'appliance',
            priority: 'medium',
            status: 'open',
        },
    ];

    const maintenance = await MaintenanceRequest.insertMany(maintenanceData);
    console.log(`✅ Created ${maintenance.length} maintenance requests`);

    const getConvId = (id1, id2) => [id1.toString(), id2.toString()].sort().join('_');
    const msgData = [
        { conversation: getConvId(tenants[0]._id, landlords[0]._id), sender: tenants[0]._id, receiver: landlords[0]._id, content: 'Hello, I have a question about the parking spot. Is it covered?', isRead: true },
        { conversation: getConvId(tenants[0]._id, landlords[0]._id), sender: landlords[0]._id, receiver: tenants[0]._id, content: 'Yes, the parking is covered and has CCTV. Assigned spot B-14.', isRead: true },
        { conversation: getConvId(tenants[0]._id, landlords[0]._id), sender: tenants[0]._id, receiver: landlords[0]._id, content: 'Perfect, thank you! Also, is there a gym in the building?', isRead: false },
        { conversation: getConvId(tenants[1]._id, landlords[1]._id), sender: tenants[1]._id, receiver: landlords[1]._id, content: 'Hi, when will the maintenance issue be fixed?', isRead: true },
        { conversation: getConvId(tenants[1]._id, landlords[1]._id), sender: landlords[1]._id, receiver: tenants[1]._id, content: 'The electrician will visit tomorrow between 10am-12pm.', isRead: false },
        { conversation: getConvId(tenants[3]._id, landlords[2]._id), sender: tenants[3]._id, receiver: landlords[2]._id, content: 'Good morning! I want to discuss lease renewal options.', isRead: false },
    ];
    await Message.insertMany(msgData);
    console.log(`✅ Created ${msgData.length} messages`);

    const notifData = [
        { user: tenants[0]._id, title: 'Rent Due Soon', message: 'Your rent of ₹28,000 is due in 3 days.', type: 'payment', isRead: false },
        { user: tenants[0]._id, title: 'Maintenance Update', message: 'Your plumbing request is now in-progress.', type: 'maintenance', isRead: true },
        { user: tenants[1]._id, title: 'Rent Overdue', message: 'Your rent payment is overdue. Please pay immediately.', type: 'payment', isRead: false },
        { user: landlords[0]._id, title: 'New Maintenance Request', message: 'Aisha Nair submitted an AC maintenance request.', type: 'maintenance', isRead: false },
        { user: landlords[0]._id, title: 'Rent Received', message: 'Payment of ₹28,000 received from Aisha Nair.', type: 'payment', isRead: true },
        { user: landlords[1]._id, title: 'Lease Expiring Soon', message: 'Rohan Mehta\'s lease expires in 7 days.', type: 'lease', isRead: false },
        { user: adminUser._id, title: 'New Property Pending', message: 'A new property in Noida is pending your approval.', type: 'property', isRead: false },
        { user: tenants[0]._id, title: 'Welcome to RentEase!', message: 'Your account has been set up successfully. Start exploring properties!', type: 'system', isRead: true },
    ];
    await Notification.insertMany(notifData);
    console.log(`✅ Created ${notifData.length} notifications`);

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('  TEST CREDENTIALS (all use password: password123)');
    console.log('═══════════════════════════════════════════════');
    console.log('  Admin:    admin@rentease.com');
    console.log('  Landlord: rajesh@rentease.com / priya@rentease.com / amit@rentease.com');
    console.log('  Tenant:   aisha@rentease.com / rohan@rentease.com / sneha@rentease.com');
    console.log('             vikram@rentease.com / kavya@rentease.com');
    console.log('═══════════════════════════════════════════════\n');

    mongoose.connection.close();
};

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    mongoose.connection.close();
    process.exit(1);
});
