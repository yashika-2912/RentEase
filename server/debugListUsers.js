const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

(async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/RentEase';
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const users = await User.find({}, 'email role name').lean();
        console.log('DB URI:', uri);
        console.log('User count:', users.length);
        console.log(users);
        const admin = await User.findOne({ email: 'admin@rentease.local' }, 'email role name').lean();
        console.log('Admin record:', admin);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();