!function(e){function t(u){if(n[u])return n[u].exports;var r=n[u]={exports:{},id:u,loaded:!1};return e[u].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function u(e){return e&&e.__esModule?e:{"default":e}}var r=n(1),o=u(r);!function(){new o["default"]("menu",["close-menu"])}()},function(e,t,n){"use strict";function u(e){return e&&e.__esModule?e:{"default":e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var u=t[n];u.enumerable=u.enumerable||!1,u.configurable=!0,"value"in u&&(u.writable=!0),Object.defineProperty(e,u.key,u)}}return function(t,n,u){return n&&e(t.prototype,n),u&&e(t,u),t}}(),a=n(2),l=u(a),i=function(){function e(){var t=arguments.length<=0||void 0===arguments[0]?"menu":arguments[0],n=arguments.length<=1||void 0===arguments[1]?["overlay"]:arguments[1];r(this,e),this.body=document.body||document.getElementsByTagName("body")[0],this.elements=Array.prototype.slice.call(document.getElementsByClassName(t)),this.closeMenuElements=n.map(function(e){return document.getElementById(e)}),this.placeListeners()}return o(e,[{key:"placeListeners",value:function(){var e=this;this.elements.forEach(function(t){return(0,l["default"])("click",t,e.toggleMenu.bind(e))},this),this.closeMenuElements.forEach(function(t){return(0,l["default"])("click",t,e.closeMenu.bind(e))},this)}},{key:"toggleMenu",value:function(e,t){if(!t){var n=e||window.event;n.preventDefault?n.preventDefault():n.returnValue=!1}this.body.className.indexOf(" menu-open")>-1||t?this.body.className=this.body.className.replace(" menu-open",""):this.body.className+=" menu-open"}},{key:"closeMenu",value:function(e){var t=e||window.event;t.preventDefault?t.preventDefault():t.returnValue=!1,this.toggleMenu(null,!0)}}]),e}();t["default"]=i,e.exports=t["default"]},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e,t,n){return!!(e&&t&&n)&&void(t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent?t.attachEvent("on"+e,n):t[e]=n)};t["default"]=n,e.exports=t["default"]}]);