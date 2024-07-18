const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('./encryption');

const userCollection = new mongoose.Schema({
    firstName: { type: String, required: true, default: 'First Name' },
    lastName: { type: String, required: true, default: 'Last Name' },
    licenseNumber: { type: String, required: true, default: encrypt('000000') },
    age: { type: Number, required: true, default: 0 },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Driver', 'Examiner', 'Admin'], default: 'Driver' },
    dob: { type: Date, required: true, default: Date.now },
    carDetails: {
        make: { type: String, default: 'Make' },
        model: { type: String, default: 'Model' },
        carYear: { type: Number, default: 0 },
        plateNumber: { type: String, default: 'Plate Number' },
    }
});

userCollection.pre('save', function(next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', userCollection);
module.exports = User;