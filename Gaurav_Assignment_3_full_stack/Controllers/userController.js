const User = require('../Model/UserModel');
const { encrypt, decrypt } = require('../Model/encryption');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    const { username, password, confirmPassword, userType, firstName, lastName, licenseNumber, age, dob, make, model, carYear, plateNumber } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const newUser = new User({
            firstName,
            lastName,
            licenseNumber,
            age,
            username,
            password,
            userType,
            dob,
            carDetails: { make, model, carYear, plateNumber }
        });

        await newUser.save();
        res.status(201).send('User created successfully');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Error creating user');
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { title: 'Login', message: 'Please fill in all required fields' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { title: 'Login', message: 'Invalid username or password' });
        }

        req.session.user = user;
        res.redirect('/g2');
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { title: 'Login', message: 'Error logging in' });
    }
};

exports.getG = async (req, res) => {
    const user = await User.findOne({ username: req.session.user.username });
    user.licenseNumber = decrypt(user.licenseNumber);

    if (user) {
        if (user.firstName === 'First Name' && user.lastName === 'Last Name' && user.licenseNumber === '000000' && user.age === 0) {
            res.redirect('/g2');
        } else {
            res.render('g', { title: 'G Page', user: user, message: null, goToG2: false });
        }
    } else {
        res.redirect('/login');
    }
};

exports.postG = async (req, res) => {
    const { make, model, carYear, plateNumber } = req.body;
    try {
        const user = await User.findOne({ username: req.session.user.username });
        if (user) {
            user.carDetails.make = make;
            user.carDetails.model = model;
            user.carDetails.carYear = carYear;
            user.carDetails.plateNumber = plateNumber;
            await user.save();
            user.licenseNumber = decrypt(user.licenseNumber);
            res.render('g', { title: 'G Page', user: user, message: 'Updated successfully', goToG2: false });
        } else {
            res.render('g', { title: 'G Page', message: 'No User Found', goToG2: true, user: user });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.getG2 = async (req, res) => {
    const user = await User.findOne({ username: req.session.user.username });
    user.licenseNumber = decrypt(user.licenseNumber);

    if (user) {
        if (user.firstName === 'First Name' && user.lastName === 'Last Name' && user.licenseNumber === '000000' && user.age === 0) {
            user.dob = new Date();
            res.render('g2', { title: 'G2 Page', message: 'New Client? fill the form', user });
        } else {
            res.redirect('/g');
        }
    } else {
        res.redirect('/login');
    }
};

exports.Dashboard = async (req, res) => {
    if (req.session && req.session.user) {
        const user = req.session.user;
        res.render('dashboard', { title: 'Dashboard', user: req.session.user });
    } else {
        res.redirect('/login');
    }
};

exports.getLogin = async (req, res) => {
    res.render('login', { title: 'Login', message: null });
};

exports.getSignUp = async (req, res) => {
    res.render('signup', { title: 'Signup', message: null });
};


exports.getLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
};


exports.postG2 = async (req, res) => {
    const { firstName, lastName, licenseNumber, age, dob, make, model, carYear, plateNumber } = req.body;
    try {
        const user = await User.findOne({ username: req.session.user.username });
        if (!user) {
            return res.redirect('/login');
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.licenseNumber = encrypt(licenseNumber);
        user.age = age;
        user.dob = dob;
        user.carDetails.make = make;
        user.carDetails.model = model;
        user.carDetails.carYear = carYear;
        user.carDetails.plateNumber = plateNumber;

        await user.save();
        res.redirect('/g');
    } catch (err) {
        console.error('Error updating user:', err);
        res.render('g2', { title: 'G2 Page', message: 'Error updating user information', user });
    }
};


