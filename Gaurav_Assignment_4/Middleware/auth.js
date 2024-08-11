exports.protectRoute = (req, res, next) => {
    if (req.session.user && req.session.user.userType === 'Driver') {
        next();}

    else  if (req.session && req.session.user && req.session.user.userType === 'Admin') {
        next();
    } else {
        res.redirect('/');
    }
};
