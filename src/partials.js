
    export default {
      'header': () => { return import(/* webpackChunkName: "example-header" */ './modules/example-module/components/example-header/example-header.js') }, 
'drawer': () => { return import(/* webpackChunkName: "example-drawer" */ './modules/example-module/components/example-drawer/example-drawer.js') }
    }
  