var express = require("express"),
    router = express.Router({ mergeParams: true }),
    Comment = require("../models/comment"),
    Campground = require("../models/campground"),
    middleware = require("../middleware");

// All routes have /campgrounds/:slug/comments at the beginning

// NEW - show form to create new comment on a campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Campground.findOne({ slug: req.params.slug }, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
});

// CREATE - create new comment on a campground
router.post("/", middleware.isLoggedIn, function (req, res) {
    Campground.findOne({ slug: req.params.slug }, function (err, campground) {
        if (err) {
            req.flash("error", "Requested campground was not found");
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Error while creating review");
                } else {
                    // Add username and ID to comment and save comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    // Add comment to campground and save campground
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Review successfully added");
                    res.redirect('/campgrounds/' + campground.slug);
                }
            });
        }
    });
});

// EDIT - edit a comment on a campground
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err || !foundComment){
            req.flash("error", "Requested review was not found");
           res.redirect("back");
       } else {
         res.render("comments/edit", {campground_slug: req.params.slug, comment: foundComment});
       }
    });
 });

// UPDATE - update comment on a campground
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findOneAndUpdate({ "_id": req.params.comment_id }, req.body.comment, function (err, updatedComment) {
        if (err) {
            console.log(err);
            req.flash("error", "Requested review was not found");
            res.redirect("back");
        } else {
            req.flash("success", "Review successfully updated");
            res.redirect("/campgrounds/" + req.params.slug);
        }
    });
});

// DESTROY - delete a comment on a campground
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findOneAndDelete({ "_id": req.params.comment_id }, function (err) {
        if (err) {
            console.log(err);
            req.flash("error", "Requested review was not found");
            res.redirect("back");
        } else {
            req.flash("success", "Review successfully deleted");
            res.redirect("/campgrounds/" + req.params.slug);
        }
    });
});

module.exports = router;