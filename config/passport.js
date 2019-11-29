// Include modules
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Import models
const User = require('../models/user')

module.exports = passport => {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          req.flash('warning_msg', 'Email尚未註冊')
          return done(null, false, { message: 'That email is not registered' })
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (isMatch) {
            return done(null, user)
          } else {
            req.flash('warning_msg', 'Email或密碼錯誤')
            return done(null, false, { message: 'Email or Password incorrect' })
          }
        })
      })
    })
  )

  passport.use(
    new FacebookStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK,
      profileFields: ['email', 'displayName']
    }, (accessToken, refreshToken, profile, done) => {
      User.findOne({
        email: profile._json.email
      }).then(user => {
        if (!user) {
          let randomPassword = Math.random().toString(36).slice(-8)
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(randomPassword, salt, (err, hash) => {
              let newUser = new User({
                name: profile._json.name,
                email: profile._json.email,
                password: hash
              })
              newUser.save().then(user => {
                return done(null, user)
              }).catch(err => {
                console.error(err)
              })
            })
          })
        } else {
          return done(null, user)
        }
      })
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })
}