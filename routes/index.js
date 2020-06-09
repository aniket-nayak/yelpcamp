var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campgrounds");
var middleware = require("../middleware/index");


//HOME PAGE
router.get("/", function (req, res) {
    res.render("landing");
});


//=====================
//Auth Routes
//=====================

//Show Register Routes
router.get("/register", function (req, res) {
    res.render("register");
});

// Register Logic
router.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar,
        about: req.body.about
    });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to Yelpcamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//Login Form
router.get("/login", function (req, res) {
    res.render("login");
});

//Login Logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function (req, res) {

});

//Logout 
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged You Out!!");
    res.redirect("/campgrounds");
});

//=======================
// User Routes
//=======================
router.get("/users/:id", function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            Campground.find().where("author.id").equals(foundUser._id).exec(function (err, campgrounds) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    res.render("users/show", {
                        user: foundUser,
                        campgrounds: campgrounds
                    });
                }
            })
        }
    });
});


module.exports = router;