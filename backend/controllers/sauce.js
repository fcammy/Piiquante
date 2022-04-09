const Sauce = require("../models/sauce");
const fs = require("fs");
//const ObjectID = require("mongodb").ObjectId;
const { validateSauce } = require("../sauceValidation");

// function to create sauces

exports.createSauce = (req, res) => {

  // Parsing the request body

  const data = JSON.parse(req.body.sauce);

  // Joi validation

  const { error } = validateSauce(data);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const url = req.protocol + "://" + req.get("host");

  // Creating the sauce

  const sauce = new Sauce({
    name: data.name,
    manufacturer: data.manufacturer,
    description: data.description,
    mainPepper: data.mainPepper,
    imageUrl: url + "/images/" + req.file.filename,
    heat: data.heat,
    likes: 0,
    dislikes: 0,
    userId: req.auth.userId,
  });
  sauce
    .save()
    .then(() =>
      res.status(201).json({
        message: "Sauce added to database.",
      })
    )
    .catch((error) =>
      res.status(403).json({
        error,
      })
    );
};

// Function to get all the sauces

exports.getAllSauces = (req, res) => {

  // Using the find() method to get all the sauces
  Sauce.find()

  // Sending a response with the sauces
    .then((sauces) => {
      res.status(200).json(sauces);
    })

    // Sending an error if the sauces are not found
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Function to get a sauce by id

exports.getOneSauce = (req, res) => {

  // Using the findOne() method to get a sauce by id
  Sauce.findOne({
    _id: req.params.id,
  })

    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};


// Function to update a sauce

exports.updateSauce = (req, res) => {

  // Declaring the variables
  let sauce = new Sauce({
    _id: req.params.id,
  });
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    req.body.sauce = JSON.parse(req.body.sauce);
    
    // Declaring the update object body

    sauce = {
      _id: req.params.id,
      name: req.body.sauce.name,
      manufacturer: req.body.sauce.manufacturer,
      description: req.body.sauce.description,
      mainPepper: req.body.sauce.mainPepper,
      imageUrl: url + "/images/" + req.file.filename,
      heat: req.body.sauce.heat,
      userId: req.body.sauce.userId,
    };
  } else {


    sauce = {
      _id: req.params.id,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      mainPepper: req.body.mainPepper,
      heat: req.body.heat,
      imageUrl: req.body.imageUrl,
      userId: req.body.userId,
    };
  }

  Sauce.updateOne(
    {
      _id: req.params.id,
    },
    sauce
  )
    .then(() => {
      res.status(201).json({
        message: "Sauce updated !",
      });
    })
    .catch((error) => {
      res.status(403).json({
        error: error,
      });
    });
};

// Function to delete a sauce

exports.deleteSauce = async (req, res) => {
  
  // Using the try catch block to handle the error

  try {
    const sauce = await Sauce.findOne({
      _id: req.params.id,
    });

    // If the sauce is not found
    if (!sauce) throw new Error("Sauce not found");

    // If the user is not the owner of the sauce

    if (!sauce.userId.equals(req.auth.userId))
      throw new Error("Unauthorized request !");

    // Deleting the sauce

    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, async () => {
      await Sauce.deleteOne({
        _id: req.params.id,
      });

      res.status(200).json({
        message: "Sauce Deleted !",
      });
    });

    // Changing default error message that is thrown by MongoDB

  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed for value"))
      error.message = "Invalid sauce ID";

    res.status(400).json({
      error: error.message,
    });
  }
};

// Function to like and dislike a sauce

exports.likeSauce = async (req, res) => {

  try {

    // Using the findOne() method to get a sauce by id

    const sauce = await Sauce.findOne({
      _id: req.params.id,
    });

    // Validation for liking a sauce

    if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
      Sauce.updateOne(
        {
          _id: req.params.id,
        },
        {
          $inc: {
            likes: 1,
          },
          $push: {
            usersLiked: req.body.userId,
          },
        }
      ).then(() =>
        res.status(200).json({
          message: "Sauce liked!",
        })
      );

      return;
    }

    // Validation for unliking a sauce

    if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
      Sauce.updateOne(
        {
          _id: req.params.id,
        },
        {
          $inc: {
            likes: -1,
          },
          $pull: {
            usersLiked: req.body.userId,
          },
        }
      ).then(() =>
        res.status(200).json({
          message: "Sauce unliked!",
        })
      );

      return;
    }

    // Validation for disliking a sauce
    if (
      !sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1
) {
      Sauce.updateOne(
        {
          _id: req.params.id,
        },
        {
          $inc: {
            dislikes: 1,
          },
          $push: {
            usersDisliked: req.body.userId,
          },
        }
      ).then(() =>
        res.status(200).json({
          message: "Sauce disliked!",
        })
      );

      return;
    }

    // Validation for unliking a dislike

    if (sauce.userDisliked.includes(req.body.userId) && req.body.like === 0) {
      Sauce.updateOne(
        {
          _id: req.params.id,
        },
        {
          $inc: {
            dislikes: -1,
          },
          $pull: {
            usersDisliked: req.body.userId,
          },
        }
      ).then(() =>
        res.status(200).json({
          message: "Sauce undislike!",
        })
      );

      return;
    } else {
      return false;
    }
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};
