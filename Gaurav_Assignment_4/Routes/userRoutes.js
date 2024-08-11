const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { protectRoute } = require('../Middleware/auth');

router.get('/', (req, res) => {
    res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});

router.get('/logout', userController.getLogout);
router.get('/login', userController.getLogin);
router.get('/signup', userController.getSignUp);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/g', protectRoute, userController.getG);
router.post('/g', protectRoute, userController.postG);
router.get('/g2', protectRoute, userController.getG2);
router.post('/g2', protectRoute, userController.postG2);
router.post('/select-appointment', userController.selectAppointment);
router.get('/dashboard', protectRoute, userController.Dashboard);
//Admin
router.get('/appointment', protectRoute, userController.getAppointment);
router.post('/createAppointment', protectRoute, userController.createAppointment);


module.exports = router;
