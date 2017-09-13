import 'polymer/polymer.html'
import 'polymerfire/firebase-auth.html'
import 'polymerfire/firebase-document.html'
import 'paper-input/paper-input.html'
import 'paper-button/paper-button.html'
import './landing-page.html'
import QrCode from 'qrcode-reader'
const qr = new QrCode()
const eventId = 30021508139

qr.callback

class LandingPage extends Polymer.GestureEventListeners(Polymer.Element) {
  static get is() { return 'landing-page' }

  static get properties() {
    return {
      user: {
        type: Object,
        value: null
      },
      snapped: {
        type: Boolean,
        value: false
      },
      sponsor: {
        type: Object
      },
      sponsorId: {
        type: Object
      }
    }
  }

  static get observers() {
    return [
      '_userReady(user.uid)',
      'resize(sponsorId.value)'
    ]
  }

  constructor() {
    super()
    this._qr = new QrCode()
    this._qr.callback = (error, result) => {
      if (error) {
        App.Shell.showMessage('Error in scanning: ' + (error.message || error.name || error), function () { App.Shell.closeToast() }, 'Close', null, 4000)
        Raven.captureException(error)
        return console.log(error)
      }
      App.Shell.showMessage(result.result, function () { App.Shell.closeToast() }, 'Close', null, 4000)

      const headers = new Headers()
      headers.append('Content-Type', 'application/json')
      var user = this.user
      if (user) {
        user.getIdToken().then(token => {
          fetch('/scan', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              id: result.result,
              uid: user.uid,
              token,
              event: eventId
            })
          }).then(res => {
            return res.json()
          }).then(json => {
            if (json.success) {
              App.Shell.showMessage('Scan complete for ' + json.profile.email, function () { App.Shell.closeToast() }, 'Close', null, 10000)
            } else {
              Raven.captureException(json)
              App.Shell.showMessage('Error in scanning: ' + json.message, function () { App.Shell.closeToast() }, 'Close', null, 10000)
            }
          })
        })
      }
      console.log(result)
    }
    this._boundResize = this._boundResize || this.resize.bind(this)
    window.addEventListener('resize', this._boundResize)


  }

  login() {
    this.shadowRoot.querySelector('#auth').signInWithPopup().then(result => {
      this.user = result.user
    })
  }

  logout() {
    this.shadowRoot.querySelector('#auth').signOut()
  }



  _userReady(uid) {
    if (uid) {
      firebase.app().database().ref(`dev/user/list/sponsor/${uid}/value`).once('value').then((snapshot) => {
        if (!snapshot.exists()) {
          console.log('You are not part of any sponsors')
        } else {
          Polymer.RenderStatus.afterNextRender(this, () => {
            var video = this.shadowRoot.querySelector('#video');
            // Get access to the camera!
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

              console.log(navigator.mediaDevices.getSupportedConstraints());
              // Not adding `{ audio: true }` since we only want video now
              navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } }).then((stream) => {
                video.src = window.URL.createObjectURL(stream);
                video.play();
                // setTimeout(function() {console.log(video.videoHeight)}, 1000)
              }).catch((error) => {
                console.error(error)
                Raven.captureException(error)
                // this.$.toast.show(error.message, 5000);
              });
            }
            this.resize();
          });
        }
      })
    }
  }

  resize() {
    // this.$$('#uploading-dialog').center();
    var canvas = this.shadowRoot.querySelector('#canvas');
    var video = this.shadowRoot.querySelector('#video');
    var size = this.windowSize();
    if (canvas && video) {
      this.height = size.height - 240;
      this.width = size.width - 80;
      video.height = this.height
      video.width = this.width
      canvas.height = this.height
      canvas.width = this.width;
    }
  }

  windowSize() {
    var width = 0;
    var height = 0;
    if (window && document) {
      if (typeof window.innerWidth === 'number') {
        // Non-IE
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (document.documentElement && (
        document.documentElement.clientWidth ||
        document.documentElement.clientHeight)) {
        // IE 6+ in 'standards compliant mode'
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
      } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        // IE 4 compatible
        width = document.body.clientWidth;
        height = document.body.clientHeight;
      }
    }
    return { width: width, height: height };
  }

  scanned() {
    App.Shell.showMessage('Scan start', function () { App.Shell.closeToast() }, 'Close', null, 10000)
    var video = this.shadowRoot.querySelector('#video')
    var canvas = this.shadowRoot.querySelector('#canvas');
    var context = canvas.getContext('2d');

    var width2 = (video.videoWidth * this.height) / video.videoHeight;
    var height2 = (video.videoHeight * this.width) / video.videoWidth;

    if (height2 > this.height) {
      context.drawImage(video, (this.width - width2) / 2, 0, width2, this.height);
    } else {
      context.drawImage(video, 0, (this.height - height2) / 2, this.width, height2);
    }

    var dataURL = canvas.toDataURL();
    Raven.captureMessage('dataURL: ' + dataURL)
    this._qr.decode(dataURL)
    // this._qr.decode(`http://localhost:5000/images/test.png`);
  }

  validate() {
    var validate = this.shadowRoot.querySelector('#validate').value
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    var user = this.user
    if (user && validate) {
      user.getIdToken().then(token => {
        fetch('/validate', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            uid: user.uid,
            token,
            validate
          })
        }).then(res => {
          return res.json()
        }).then(json => {

          if (json.success) {
            App.Shell.showMessage('Validation successful', function () { App.Shell.closeToast() }, 'Close', null, 10000)
          } else {
            Raven.captureException(json)
            App.Shell.showMessage('Cannot validate your company', function () { App.Shell.closeToast() }, 'Close', null, 10000)
          }
        })
      })
    }
  }
}

window.customElements.define(LandingPage.is, LandingPage)

export default LandingPage