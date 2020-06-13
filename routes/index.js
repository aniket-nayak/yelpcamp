var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campgrounds");
var middleware = require("../middleware/index");
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageF = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({
    storage: storage,
    fileF: imageF
})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'anishaan',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


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
router.post("/register", upload.single('avatar'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.user.avatar = result.secure_url;
        // add author to campground
        User.register(req.body.user, req.body.password, function (err, user) {
            if (err) {
                req.flash("error", err.message);
                console.log(err);
                return res.redirect("/register");
            } else {

                req.flash("success", "You are successfully registered , now login as " + user.username);
                res.redirect("/login");

                /*passport.authenticate("local")(req, res, function () {
                    req.flash("success", "Welcome to Yelpcamp " + user.username);
                    res.redirect("/campgrounds");
                });*/
            }
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
//==============================================
//User Routes
//==============================================
router.get("/users/:id", function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect("back");
        } else {
            Campground.find().where("author.id").equals(foundUser._id).exec(function (err, campgrounds) {
                if (err) {
                    req.flash("error", "Something went wrong!");
                    res.redirect("back");
                } else {
                    res.render("users/show", {
                        user: foundUser,
                        campgrounds: campgrounds
                    });
                }
            })

        }
    })
})



module.exports = router;