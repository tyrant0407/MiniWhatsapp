const express = require('express');
const router = express.Router();
const userModel = require("./users.js")
const messageModel = require('./message.js')
const passport = require('passport')
const localStrategy = require('passport-local')
const axios = require('axios')

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.ejs', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login.ejs');
});
router.get('/home', isLoggedIn, async function(req, res, next) {
  let loggedInUser = await userModel
  .findOne({username: req.session.passport.user}).populate('friends')
  
  res.render('home.ejs',{loggedInUser});
});
router.get('/logout',function(req, res,next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

//post

router.post('/register', function(req, res, next) {
  const user = new userModel({
    username:req.body.username,
    name:req.body.name,
    email:req.body.email,
  })
  userModel.register(user,req.body.password)
  .then(function(){
  passport.authenticate('local')(req,res, function(err){
    res.redirect('/home')
     })
  })
});

router.post('/searchUser',isLoggedIn,async function(req,res,next){
  const data = req.body.data

  const allUsers = await userModel.find({
    username:{
      $regex:data,
      $options:'i'
    }
  })
  // console.log(allUsers)
 res.status(200).json(allUsers)
})
// router.post('/addFriend', isLoggedIn , async (req, res, next) => {
//   const friendId = req.body.friendId

//   const friendUser = await userModel.findOne({
//     _id: friendId
//   })

//   const loggedInUser = await userModel.findOne({
//     username: req.session.passport.user
//   })

//   const indexOfFriendUser = loggedInUser.friends.indexOf(friendUser._id)

//   if (indexOfFriendUser !== -1) {
//     res.status(200).json({
//       message: 'already friends'
//     })
//     return
//   }

//   loggedInUser.friends.push(friendUser._id)
//   friendUser.friends.push(loggedInUser._id)

//   await loggedInUser.save()
//   await friendUser.save()

//   res.status(200).json({
//     message: "friend added"
//   })

// })

router.post('/addFriend', isLoggedIn , async (req, res, next) => {
  const friendId = req.body.friendId

  const friendUser = await userModel.findOne({
    _id: friendId
  })

  const loggedInUser = await userModel.findOne({
    username: req.session.passport.user
  })

  const indexOfFriendUser = loggedInUser.friends.indexOf(friendUser._id)

  if (indexOfFriendUser !== -1) {
    res.status(200).json({
      message: 'already friends'
    })
    return
  }

  loggedInUser.friends.push(friendUser._id)
  friendUser.friends.push(loggedInUser._id)

  await loggedInUser.save()
  await friendUser.save()

  res.status(200).json({
    message: "friend added"
  })

})


router.post('/login', passport.authenticate("local",{
  successRedirect:"/home",
  failureRedirect: "/login",
}) ,function(req, res) {
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}
module.exports = router;
