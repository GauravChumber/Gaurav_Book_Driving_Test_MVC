const User = require('../Model/UserModel');
const { encrypt, decrypt } = require('../Model/encryption');
const bcrypt = require('bcrypt');


exports.Dashboard = async (req, res) => {
    if (req.session && req.session.user) {
        const user = req.session.user;
        res.render('dashboard', { title: 'Dashboard', user: req.session.user });
    } else {
        res.redirect('/login');
    }
};

exports.getSignUp = async (req, res) => {
    res.render('signup', { title: 'Signup', message: null });
};

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

exports.getLogin = async (req, res) => {
    res.render('login', { title: 'Login', message: null });
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
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { title: 'Login', message: 'Error logging in' });
    }
};

exports.getLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
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
// exports.getG2 = async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.session.user.username });
//         user.licenseNumber = decrypt(user.licenseNumber);

//         if (user) {
//             if (user.firstName === 'First Name' && user.lastName === 'Last Name' && user.licenseNumber === '000000' && user.age === 0) {
//                 user.dob = new Date();
//                 res.render('g2', { title: 'G2 Page', message: 'New Client? Fill the form', user, availableAppointments: [] });
//             } else {
//                 const availableAppointments = await Appointment.find({ isTimeSlotAvailable: true });
//                 res.render('g2', {
//                     title: 'G2 Test',
//                     message: req.session.message || '',
//                     user: user,
//                     availableAppointments: availableAppointments
//                 });
//                 req.session.message = null;  
//             }
//         } else {
//             res.redirect('/login');
//         }
//     } catch (err) {
//         console.error('Error fetching user or available appointments:', err);
//         res.status(500).send('Error fetching user or available appointments');
//     }
// };

// exports.getG2 = async (req, res) => {
//     const user = await User.findOne({ username: req.session.user.username });
//     user.licenseNumber = decrypt(user.licenseNumber);

//     try {
//         if (!user) {
//             return res.redirect('/login');
//         }

//         // Fetch available appointments
//         const availableAppointments = await Appointment.find({ isTimeSlotAvailable: true });

//         // Check if user's details are default
//         const isDefaultUser = user.firstName === 'First Name' && 
//                               user.lastName === 'Last Name' && 
//                               user.licenseNumber === '000000' && 
//                               user.age === 0;

//         if (isDefaultUser) {
//             user.dob = new Date();
//             res.render('g2', { 
//                 title: 'G2 Page', 
//                 message: 'New Client? Fill the form', 
//                 user,
//                 availableAppointments 
//             });
//         } else {
//             res.render('g2', { 
//                 title: 'G2 Page', 
//                 user, 
//                 availableAppointments,
//                 message: availableAppointments.length > 0 ? null : 'No available appointments at the moment'
//             });
//         }
//     } catch (err) {
//         console.error('Error fetching appointments:', err);
//         res.status(500).send('Internal Server Error');
//     }
// };

exports.getG2 = async (req, res) => {
    try {
        const user = await User
            .findOne({ username: req.session.user.username })
            .populate("appointmentId");
        user.licenseNumber = decrypt(user.licenseNumber);

        if (!user) {
            return res.redirect('/login');
        }

        // Fetch available appointment slots
        const availableAppointments = await Appointment.find({ isTimeSlotAvailable: true });

        if (user.firstName === 'First Name' && user.lastName === 'Last Name' && user.licenseNumber === '000000' && user.age === 0) {
            user.dob = new Date();
        }

        res.render('g2', { 
            title: 'G2 Page', 
            message: user.firstName === 'First Name' ? 'New Client? fill the form' : null,
            user,
            availableAppointments 
        });
    } catch (err) {
        console.error('Error fetching user or appointments:', err);
        res.status(500).send('Internal Server Error');
    }
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
        res.redirect('/g2');
    } catch (err) {
        console.error('Error updating user:', err);
        res.render('g2', { title: 'G2 Page', message: 'Error updating user information', user });
    }
};

const Appointment = require('../Model/appointmentModel');

exports.selectAppointment = async (req, res) => {
    const { appointmentId } = req.body;
console.log(req.body);
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment || !appointment.isTimeSlotAvailable) {
            return res.status(400).send('Appointment slot is not available');
        }

        // Mark the appointment as not available
        appointment.isTimeSlotAvailable = false;
        await appointment.save();

        // Update the user's appointmentId
        const user = await User
            .findById(req.session.user._id);
        user.appointmentId = appointmentId;
        await user.save();

        user.licenseNumber = decrypt(user.licenseNumber);
        req.session.user = user; // Update session user
        user.appointmentId = appointment;

        res.render('g2', {
            title: 'G2 Test',
            user: req.session.user,
            message: `Appointment selected for ${appointment.date.toISOString().split("T")[0]} at ${appointment.time}`,
            availableAppointments: await Appointment.find({ isTimeSlotAvailable: true })
        });
    } catch (err) {
        console.error('Error selecting appointment:', err);
        res.render('g2', {
            title: 'G2 Test',
            user: req.session.user,
            message: 'Error selecting appointment',
            availableAppointments: await Appointment.find({ isTimeSlotAvailable: true })
        });
    }
};

// Admin page get request

exports.getAppointment = async (req, res) => {
    if (req.session && req.session.user) {
        try {
            const appointments = await Appointment.find({});
            res.render('appointment', {
                title: 'Appointment',
                user: req.session.user,
                message: null,
                appointments
            });
        } catch (err) {
            console.error('Error fetching appointments:', err);
            res.render('appointment', {
                title: 'Appointment',
                user: req.session.user,
                message: 'Error fetching appointments',
                appointments: []
            });
        }
    } else {
        res.redirect('/login');
    }
};



exports.createAppointment = async (req, res) => {
    const { date, time } = req.body;

    try {
        const existingAppointment = await Appointment.findOne({ date, time });

        if (existingAppointment) {
            const appointments = await Appointment.find({});
            return res.render('appointment', {
                title: 'Appointment',
                user: req.session.user,
                message: 'Appointment slot already exists',
                appointments
            });
        }

        const newAppointment = new Appointment({
            date,
            time,
            isTimeSlotAvailable: true
        });

        await newAppointment.save();

        const appointments = await Appointment.find({});
        res.render('appointment', {
            title: 'Appointment',
            user: req.session.user,
            message: 'Appointment slot created successfully',
            appointments
        });
    } catch (err) {
        console.error('Error creating appointment:', err);
        const appointments = await Appointment.find({});
        res.render('appointment', {
            title: 'Appointment',
            user: req.session.user,
            message: 'Error creating appointment',
            appointments
        });
    }
};




