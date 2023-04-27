const User = require("../model/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require('express-jwt');

exports.signup = (req, res) => {
  const errors = validationResult(req);

  console.log(req.body.name)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }
  console.log(new User(req.body));
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB"
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  console.log(errors)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User email does not exists"
      });
    }

    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    //send response to front end
    const { _id, name, email, role, cart, address } = user;
    return res.json({ user: { id:_id, name, email, address, role, token, cart } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfully"
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  secret: "learncodeonline",
  userProperty: "auth",
  algorithms: ["HS256"]
})

//custom middlewares
exports.isAuthenticated = (req, res, next) => {

  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  console.log(req.profile && req.auth && req.profile._id == req.auth._id)
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED"
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  console.log(req.profile.role === 0)
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied"
    });
  }
  next();
};
