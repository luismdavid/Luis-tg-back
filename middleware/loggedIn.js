const passport = require("passport");

const loggedIn = passport.authenticate('jwt', { session: false });

module.exports = loggedIn;
