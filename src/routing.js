
    export default {
      '/': () => { return import(/* webpackChunkName: "landing-page" */ './modules/pwdo-module/pages/landing-page/landing-page.js') }, 
'/see-scanned': () => { return import(/* webpackChunkName: "scanned-page" */ './modules/pwdo-module/pages/scanned-page/scanned-page.js') }
    }
  