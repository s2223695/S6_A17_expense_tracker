// Include modules
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const helpers = require('handlebars-helpers')(exphbs)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

// Define server variables
const port = 3000

// Setting environment
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// Setting database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/expense_tracker', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!!!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

// Setting express-handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// Setting body-parser
app.use(bodyParser.urlencoded({ extended: true }))

// Setting method-override
app.use(methodOverride('_method'))

// Setting express-session
app.use(session({
  secret: 'jaoisgjoiroieaoie',
  resave: false,
  saveUninitialized: true
}))

// Setting passport
app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')(passport)

// Setting connect-flash
app.use(flash())

// Setting res local variables
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.isAuthenticated = req.isAuthenticated()

  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
})

// Setting route middleware
app.use('/', require('./routes/home'))
app.use('/records', require('./routes/record'))
app.use('/users', require('./routes/user'))
app.use('/auth', require('./routes/auths'))

// Start listening on port
app.listen(process.env.PORT || port, () => {
  console.log('Express start listening')
})