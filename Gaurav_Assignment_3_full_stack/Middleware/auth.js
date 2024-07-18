exports.protectRoute = (req, res, next) => {
    if (req.session.user && req.session.user.userType === 'Driver') {
        next();
    } else {
        res.redirect('/');
    }
};