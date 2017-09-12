import 'polymer/polymer.html'
import './scanned-page.html'

class ScannedPage extends Polymer.Element {
  static get is () { return 'scanned-page' }
}

window.customElements.define(ScannedPage.is, ScannedPage)

export default ScannedPage