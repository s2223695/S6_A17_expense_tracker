// Include modules
const mongoose = require('mongoose')

// Import models
const User = require('../user')
const Record = require('../record').Record

mongoose.connect('mongodb://localhost/expense_tracker', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const db = mongoose.connection

db.on('error', () => {
  console.error('db error!!!')
})

db.once('open', () => {
  console.log('db connected!')

  const users = require('./user.json').dataList
  const records = require('./record.json').dataList

  users.forEach(user => {
    const newUser = new User({
      name: user.name,
      email: user.email,
      password: user.password
    })

    newUser.save().then(user => {
      const userRecords = records.splice(0, 3)
      userRecords.forEach(record => {
        Record.create({
          name: record.name,
          category: record.category,
          date: record.date,
          amount: record.amount,
          totalAmount: record.totalAmount,
          userId: user._id
        })
      })
    }).catch(err => {
      console.error(err)
    })
  })

  console.log('done!!')
})