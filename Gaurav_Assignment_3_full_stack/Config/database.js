const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://gauravchumber20:kPGVeisdzPNSy3R1@driving-test-assignment.5r9e33u.mongodb.net/?retryWrites=true&w=majority&appName=Driving-Test-Assignment';

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;