var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = require("../middleware/index");

//Comments new
router.get("/new", middleware.isLoggedIn, function (req, res) {
    // Find Campground by Id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {
                campground: campground
            });
        }
    });
});
//comments post
router.post("/", middleware.isLoggedIn, function (req, res) {
    //Lookup Comment using Id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //create new Comment 
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something Went Wrong!");
                    console.log(err);
                } else {
                    //add username and id to commnets
                    comment.author.id = req.user.id;
                    comment.author.username = req.user.username;
                    //save the comments
                    comment.save();
                    //connect new comment to the campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect
                    req.flash("success", "Successfully added comments!!!");
                    res.redirect("/campgrounds/" + campground._id)
                }
            })
        }
    });
});

// Edit Routes
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("comments/edit", {
                campground_id: req.params.id,
                comment: foundComment
            });
        }
    });
});
// Update Comment
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Comment updated!!!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

//Delete Comment Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function (err) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!!!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
})

module.exports = router;