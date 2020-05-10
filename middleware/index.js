var Comment     = require("../models/comment"),
    Campground  = require("../models/campground");

// All the middleware
var middlewareObj = {};

//Middlware to determine campground ownership
middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //Check if user is logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Requested campground was not found");
                res.redirect("back");
            } else {
                //Check if logged in user owns the campground
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "Insufficient permissions to perform requested action");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to perform the requested action");
        res.redirect("back");
    }
};

//Middlware to determine comment ownership
middlewareObj.checkCommentOwnership = function(req, res, next){
    //Check if user is logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Requested comment was not found");
                res.redirect("back");
            } else {
                //Check if logged in user owns the comment
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "Insufficient permissions to perform requested action");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to perform the requested action");
        res.redirect("back");
    }
};

// Middleware to determine if user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to perform the requested action");
    res.redirect("/login");
};

module.exports = middlewareObj;