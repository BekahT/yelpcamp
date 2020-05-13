var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user"),
    Campground = require("../models/campground");

// Root Route
router.get("/", function (req, res) {
    res.render("landing");
});

// =================
// Authentication Routes
// =================

// Show Registration Form
router.get("/register", function (req, res) {
    res.render("register", { page: 'register' });
});

// Register New User from Form Submission
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username, email: req.body.email, avatar: req.body["avatar"] });
    if (req.body.adminCode === 'whitebread') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register", { "error": "Error: " + err.message });
        }
        // Login and redirect to campgrounds
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Account successfully created. Welcome to YelpCamp, " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// Log in Form
router.get("/login", function (req, res) {
    res.render("login", { page: 'login' });
});

// Log user in
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true
}), function (req, res) {
});

// Log user out
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "User has been logged out");
    res.redirect("/campgrounds");
});

// =================
// User Profiles Route
// =================

router.get("/users/:id", function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", "Error finding user!");
            res.redirect("/");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec(function (err, foundCampgrounds) {
            if (err) {
                req.flash("error", "Error finding campgrounds!");
                res.redirect("/");
            }
            res.render("users/show", { user: foundUser, campgrounds: foundCampgrounds });
        })
    });
});

module.exports = router;