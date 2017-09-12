
    export default {
      '/': () => { return import(/* webpackChunkName: "example-landing-page" */ './modules/example-module/pages/example-landing-page/example-landing-page.js') }, 
'style-guide': () => { return import(/* webpackChunkName: "example-style-guide-page" */ './modules/example-module/pages/example-style-guide-page/example-style-guide-page.js') }, 
'/auth': () => { return import(/* webpackChunkName: "example-authorized-page" */ './modules/example-module/pages/example-authorized-page/example-authorized-page.js') }
    }
  