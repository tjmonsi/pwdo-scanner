
    export default {
      'not-found': () => { return import(/* webpackChunkName: "example-not-found-page" */ './modules/example-module/pages/example-not-found-page/example-not-found-page.js') }, 
'not-authorized': () => { return import(/* webpackChunkName: "example-not-authorized-page" */ './modules/example-module/pages/example-not-authorized-page/example-not-authorized-page.js') }
    }
  