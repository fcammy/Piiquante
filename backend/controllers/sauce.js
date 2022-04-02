const Sauce = require("../models/sauce");

const fs = require("fs");

// function to create sauces

exports.createSauce = (req, res) => {
  const data = JSON.parse(req.body.sauce);
  const url = req.protocol + "://" + req.get("host");
  const sauce = new Sauce({
    name: data.name,
    manufacturer: data.manufacturer,
    description: data.description,
    mainPepper: data.mainPepper,
    imageUrl: url + "/images/" + req.file.filename,
    heat: data.heat,
    likes: 0,
    dislikes: 0,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce added to database." }))
    .catch((error) => res.status(400).json({ error }));
};

// Function to get all the sauces
exports.getAllSauces = (req, res) => {
  Sauce.find()

    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Function to get a sauce by id

exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })

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
  let sauce = new Sauce({ _id: req.params.id });
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    req.body.sauce = JSON.parse(req.body.sauce);

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
  Sauce.updateOne({ _id: req.params.id }, sauce)
    .then(() => {
      res.status(201).json({
        message: "Sauce updated !",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Function to delete a sauce

exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No Sauce ! "),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(401).json({
        error: new Error("Unauthorized request ! "),
      });
    }
  });
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce Deleted !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Function to like and dislike a sauce

exports.likeSauce = async (req, res) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });

    if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
      )
      .then(() => res.status(200).json({ message: "Sauce liked!" }));

      return;
    }

    if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
      ).then(() => res.status(200).json({ message: "Sauce unliked!" }));

      return;
    }

    if (
      !sauce.usersDisliked.includes(req.body.userId) &&
      req.body.like === -1
    ) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
      ).then(() => res.status(200).json({ message: "Sauce disliked!" }));

      return;
    }
    if (sauce.userDisliked.includes(req.body.userId) && req.body.like === 0) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
      ).then(() => res.status(200).json({ message: "Sauce undislike!" }));

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
