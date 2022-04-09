const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { signupValidation, loginValidation } = require("../validation");

dotenv.config();

// Creating a signup controller

exports.signup = (req, res, next) => {

  // validating the user data using Joi

  const { error } = signupValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // hashing the password

  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });

// saving the user to the database
    user
      .save()
      .then(() => {
        res.status(201).json({
          message: "User was created successfully",
        });
      })
      .catch((error) => {
        res.status(500).json({
          error: error,
        });
      });
  });
};

// Creating a login controller

exports.login = (req, res, next) => {

  // validating the user data using Joi
  const { error } = loginValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // finding the user in the database

  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: new Error("User not found!"),
        });
      }

      // comparing the password with the hash

      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          
          if (!valid) {
            return res.status(401).json({
              error: new Error("Incorrect password!"),
            });
          }

          // creating the token

          const token = jwt.sign(
            {
              userId: user._id,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "24h",
            }
          );
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => {
          res.status(500).json({
            error: error,
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
};
