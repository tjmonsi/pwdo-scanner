import 'polymer/polymer.html'
import 'polymerfire/firebase-document.html'
import 'polymerfire/firebase-auth.html'
import 'paper-button/paper-button.html'
import './scanned-page.html'

class ScannedPage extends Polymer.Element {
  static get is () { return 'scanned-page' }

  static get observers () {
    return [
      'reload(user, sponsorId.value)'
    ]
  }

  connectedCallback () {
    super.connectedCallback()
    this.reload()
  }



  reload () {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    var user = this.user
    if (user && this.sponsorId && this.sponsorId.value) {
      user.getIdToken().then(token => {
        fetch('/get-scanned', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            uid: user.uid,
            token,
            sponsor: this.sponsorId.value
          })
        }).then(res => {
          return res.json()
        }).then(json => {
          if (json.success) {
            this.scanned = json.list
          } else {
            App.Shell.showMessage('Error in loading scanned items', function() { App.Shell.closeToast() }, 'Close', null, 10000)
          }

        })
      })
    }
  }

  print () {
    window.print();
  }
}

window.customElements.define(ScannedPage.is, ScannedPage)

export default ScannedPage