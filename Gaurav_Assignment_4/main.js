const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./Config/database');
const userRoutes = require('./Routes/userRoutes');

const tApp = express();
const port = 3000;

// Middleware
tApp.use(express.urlencoded({ extended: true }));
tApp.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// View engine setup
tApp.set('views', path.join(__dirname, 'views'));
tApp.set('view engine', 'ejs');
tApp.use(express.static(path.join(__dirname, 'CSS')));

// Routes
tApp.use('/', userRoutes);

// Connect to database and start server
connectDB().then(() => {
    tApp.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => console.error(err));

// Error handling middleware
tApp.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});