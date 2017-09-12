const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const eventbrite = require('./eventbrite.json')

exports.scan = functions.https.onRequest((req, res) => {
  if (!req.body.uid && !req.body.token) {
    return res.status(404).json({
      success: false,
      message: 'No auth or uid found'
    })
  }

  if (!req.body.id) {
    return res.status(404).json({
      success: false,
      message: 'No ticket Id found'
    })
  }



  fetch(`https://www.eventbriteapi.com/v3/orders/${req.body.id.substring(0, 9)}/?token=${eventbrite.key}`).then(result => {
    return result.json()
  })
  .then(json => {
    if (json.status_code === 400) {
      return res.status(json.status_code).json(json)
    }


    console.log()
    res.status(200).json({
      data: json
    })
  })
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
