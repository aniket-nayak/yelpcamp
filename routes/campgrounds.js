var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware/index");

//this will show all the campgrounds
router.get("/", function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {
                campgrounds: allCampgrounds
            });
        }
    });
});

//this will add new campground to the db
router.post("/", middleware.isLoggedIn, function (req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {
        name: name,
        price: price,
        image: image,
        description: description,
        author: author
    };
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log("Something Went Wrong");
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

// this will take to the new campground form page
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

// This will Show the Description of that campground
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {
                campground: foundCampground
            });
        }
    });
});

//Edit Campfround
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campgrounds/edit", {
            campground: foundCampground
        });
    });
});

//Update Campground
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds/" + req.params.id + "/edit");
        } else {
            req.flash("success", "Campground Updated!!!");
            res.redirect("/campgrounds/" + updatedCampground.id);
        }
    });
});

//Destroy a particular campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Camground deleted!!!");
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;