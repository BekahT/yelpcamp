var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware");

//All routes in this file have /campgrounds at the beginning

//INDEX - show all campgrounds
router.get("/", function (req, res) {
    var noMatch = null;
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    // If a search is being done
    if (req.query.search) {
        // Santize the query term
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all matching campgrounds from DB
        Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count({name: regex}).exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = "The search returned no results. Search for a different term or reset to display all campgrounds.";
                }
                res.render("campgrounds/index", {
                    campgrounds: allCampgrounds,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage),
                    noMatch: noMatch,
                    search: req.query.search
                });
            }
        });
    });
        // If no search is being done
    } else {
        // Get all campgrounds from DB
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    // Gets data from the new campground form and adds new campground to db
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, price: price, image: image, description: desc, author: author };

    // Create new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to campgrounds page
            req.flash("success", "Campground successfully created");
            res.redirect("/campgrounds");
        }
    });
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

// SHOW - show more info about one campground
router.get("/:slug", function (req, res) {
    Campground.findOne({ slug: req.params.slug }).populate("comments").exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Requested campground was not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// EDIT - show form to edit existing campground
router.get("/:slug/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findOne({ slug: req.params.slug }, function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Requested campground was not found");
        } else {
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});

// UPDATE - make updates to existing campground
router.put("/:slug", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findOne({ slug: req.params.slug }, function (err, campground) {
        if (err) {
            req.flash("error", "Requested campground was not found");
            res.redirect("/campgrounds");
        } else {
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.image = req.body.campground.image;
            campground.save(function (err) {
                if (err) {
                    req.flash("error", "An error occurred while saving the update");
                    res.redirect("/campgrounds");
                } else {
                    req.flash("success", "Campground successfully updated");
                    res.redirect("/campgrounds/" + campground.slug);
                }
            });
        }
    });
});

// DESTROY - delete campground
router.delete("/:slug", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findOneAndRemove({ slug: req.params.slug }, function (err) {
        if (err) {
            req.flash("error", "Requested campground was not found");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground successfully deleted");
            res.redirect("/campgrounds");
        }
    });
});

// Strip out unsafe characters
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;