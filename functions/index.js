const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const eventbrite = require('./eventbrite.json')
admin.initializeApp(functions.config().firebase);

exports.scan = functions.https.onRequest((req, res) => {
  if (!req.body.uid && !req.body.token) {
    return res
      .status(404)
      .json({
        success: false,
        message: 'No auth or uid found'
      })
  }

  if (!req.body.id) {
    return res
      .status(404)
      .json({
        success: false,
        message: 'No ticket Id found'
      })
  }

  if (!req.body.event) {
    return res
      .status(404)
      .json({
        success: false,
        message: 'Event Id not found'
      })
  }

  var profile = null
  var key = null
  var sponsor = null
  const updates = {}
  const promises = []
  const ref = admin
    .database()
    .ref(`/dev/sponsorscan/data`)

  promises.push(
    fetch(`https://www.eventbriteapi.com/v3/events/${req.body.event}/attendees/${req.body.id.substring(9, 18)}/?token=${eventbrite.key}`)
      .then(result => {
        return result.json()
      })
  )

  promises.push(
    admin
      .database()
      .ref(`/dev/user/list/sponsor/${req.body.uid}/value`)
      .once('value')
  )

  Promise.all(promises)
    .then(results => {
      const json = results[0]
      const sponsorSnapshot = results[1]
      
      if (!sponsorSnapshot.exists()) {
        return Promise.reject({
          status_code: 404,
          success: false,
          message: 'You are not authorized to scan'
        })
      }

      if (json.status_code === 400) {
        return Promise.reject(json)
      }

      if (!json.profile) {
        return Promise.reject(json)
      }

      sponsor = sponsorSnapshot.val()
      
      return Promise.all([
        ref
          .orderByChild('email')
          .limitToFirst(1)
          .equalTo(json.profile.email)
          .once('value'),
        Promise.resolve(json)
      ])
    })
    .then(results => {
      const scanSnapshot = results[0]
      const json = results[1]
      scanSnapshot.forEach(child => {
        if (child.exists()) {
          profile = child.val()
          key = child.key
        }
      })
      
      if (!key) {
        profile = {
          email: json.profile.email,
          firstName: json.profile.first_name,
          lastName: json.profile.last_name
        }
        key = ref.push().key
        updates[`/dev/sponsorscan/data/${key}`] = profile
      }
      updates[`/dev/sponsorscan/list/${sponsor}/${key}/value`] = req.body.uid
      return admin
        .database()
        .ref()
        .update(updates)
    })
    .then(() => {
      res
        .status(200)
        .json({
          success: true,
          profile
        })
    })
    .catch(error => {
      console.log(error)
      return res
        .status(error.status_code || 500)
        .json(error)
    })
})

// NEED TO ADD VALIDATION OF CODE HERE
exports.validate = functions.https.onRequest((req, res) => {
  if (!req.body.uid && !req.body.token) {
    return res
      .status(404)
      .json({
        success: false,
        message: 'No auth or uid found'
      })
  }

  if (!req.body.validate) {
    return res
      .status(404)
      .json({
        success: false,
        message: 'No validationcode found'
      })
  }

  admin
    .database()
    .ref(`/dev/sponsor/data`)
    .orderByChild('validation')
    .limitToFirst(1)
    .equalTo(req.body.validate)
    .once('value')
    .then(snapshot => {
      var sponsor = null
      var key = null
      snapshot.forEach(child => {
        if (child.exists()) {
          key = child.key
          sponsor = child.val()
        }
      })

      if (!key) {
        return Promise.reject({
          status_code: 404,
          success: false,
          message: 'No company found'
        })
      }

      return admin
        .database()
        .ref(`/dev/user/list/sponsor/${req.body.uid}/value`)
        .set(key)
    })
    .then(() => {
      res
        .status(200)
        .json({
          success: true
        })
    })
    .catch(error => {
      res
        .status(error.status_code || 500)
        .json(error)
    })
})

// GET ALL SCANNED
exports.getScanned = functions.https.onRequest((req, res) => {
  if (!req.body.uid && !req.body.token) {
    return res.status(404).json({
      success: false,
      message: 'No auth or uid found'
    })
  }

  if (!req.body.sponsor) {
    return res.status(404).json({
      success: false,
      message: 'No sponsor found'
    })
  }
  var firstPromises = []

  firstPromises.push(
    admin
      .database()
      .ref(`dev/sponsorscan/list/${req.body.sponsor}`)
      .once('value')
  )

  firstPromises.push(
    admin
      .database()
      .ref(`/dev/user/list/sponsor/${req.body.uid}/value`)
      .once('value')
  )

  Promise.all(firstPromises)
    .then(results => {
      const sponsorSnapshot = results[1]
      const scanSnapshot = results[0]
      const updates = {}
      if (!sponsorSnapshot.exists()) {
        return Promise.reject({
          status_code: 404,
          success: false,
          message: 'You are not authorized to scan'
        })
      }
      var promises = []

      scanSnapshot.forEach(child => {
        promises.push(
          admin
            .database()
            .ref(`dev/sponsorscan/data/${child.key}`)
            .once('value')
        )
      })

      return Promise.all(promises)
    })
    .then(results => {
      var list = []
      results.forEach(item => {
        list.push(item.val())
      })

      return res.status(200).json({
        success: true,
        list
      })
    })
    .catch(error => {
      res
        .status(error.status_code || 500)
        .json(error)
    })

})
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
