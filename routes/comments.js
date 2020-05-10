var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Comment     = require("../models/comment"),
    Campground  = require("../models/campground"),
    middleware  = require("../middleware");

// All routes have /campgrounds/:id/comments at the beginning

// NEW - show form to create new comment on a campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   Campground.findById(req.params.id, function(err, campground){
       if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground : campground});
        }
   });
});

// CREATE - create new comment on a campground
router.post("/", middleware.isLoggedIn, function(req, res){
   Campground.findById(req.params.id, function(err, campground){
       if(err){
            console.log(err);
            req.flash("error", "Requested campground was not found");
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
               if(err) {
                   console.log(err);
               } else {
                   // Add username and ID to comment and save comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   // Add comment to campground and save campground
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success", "Comment successfully created");
                   res.redirect("/campgrounds/" + campground._id);
               }
            });
        }
   });
});

// EDIT - edit a comment on a campground
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground) {
           console.log(err);
           req.flash("error", "Requested campground was not found");
           res.redirect("back");
        } 
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                console.log(err);
                req.flash("error", "Requested comment was not found");
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment}); 
            }
        });
   });

});

// UPDATE - update comment on a campground
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findOneAndUpdate({"_id": req.params.comment_id}, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            req.flash("error", "Requested comment was not found");
            res.redirect("back");
        } else {
            req.flash("success", "Comment successfully updated");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY - delete a comment on a campground
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findOneAndDelete({"_id": req.params.comment_id}, function(err){
       if(err){
           console.log(err);
           req.flash("error", "Requested comment was not found");
           res.redirect("back");
       } else {
            req.flash("success", "Comment successfully deleted");
            res.redirect("/campgrounds/" + req.params.id);
       }
   }); 
});

module.exports = router;