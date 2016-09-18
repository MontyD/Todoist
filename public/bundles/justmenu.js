/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _components_menuEs6Js = __webpack_require__(1);

	var _components_menuEs6Js2 = _interopRequireDefault(_components_menuEs6Js);

	(function () {
	  'use strict';
	  var menuToggle = new _components_menuEs6Js2['default']('menu', ['close-menu']);
	})();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _addEventEs6Js = __webpack_require__(2);

	var _addEventEs6Js2 = _interopRequireDefault(_addEventEs6Js);

	var Menu = (function () {
	  function Menu() {
	    var openMenuClass = arguments.length <= 0 || arguments[0] === undefined ? 'menu' : arguments[0];
	    var closeMenuIDs = arguments.length <= 1 || arguments[1] === undefined ? ['overlay'] : arguments[1];

	    _classCallCheck(this, Menu);

	    this.body = document.body || document.getElementsByTagName('body')[0];

	    this.elements = Array.prototype.slice.call(document.getElementsByClassName(openMenuClass));

	    this.closeMenuElements = closeMenuIDs.map(function (ID) {
	      return document.getElementById(ID);
	    });

	    this.placeListeners();
	  }

	  _createClass(Menu, [{
	    key: 'placeListeners',
	    value: function placeListeners() {
	      var _this = this;

	      this.elements.forEach(function (el) {
	        return (0, _addEventEs6Js2['default'])('click', el, _this.toggleMenu.bind(_this));
	      }, this);
	      this.closeMenuElements.forEach(function (el) {
	        return (0, _addEventEs6Js2['default'])('click', el, _this.closeMenu.bind(_this));
	      }, this);
	    }
	  }, {
	    key: 'toggleMenu',
	    value: function toggleMenu(e, close) {
	      if (!close) {
	        var evt = e || window.event;
	        if (evt.preventDefault) {
	          evt.preventDefault();
	        } else {
	          evt.returnValue = false;
	        }
	      }
	      if (this.body.className.indexOf(' menu-open') > -1 || close) {
	        this.body.className = this.body.className.replace(' menu-open', '');
	      } else {
	        this.body.className += ' menu-open';
	      }
	    }
	  }, {
	    key: 'closeMenu',
	    value: function closeMenu(e) {
	      var evt = e || window.event;
	      if (evt.preventDefault) {
	        evt.preventDefault();
	      } else {
	        evt.returnValue = false;
	      }
	      this.toggleMenu(null, true);
	    }
	  }]);

	  return Menu;
	})();

	exports['default'] = Menu;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var addEvent = function addEvent(evnt, elem, func) {
	  'use strict';
	  if (!evnt || !elem || !func) {
	    return false;
	  }
	  if (elem.addEventListener) {
	    elem.addEventListener(evnt, func, false);
	  } else if (elem.attachEvent) {
	    elem.attachEvent('on' + evnt, func);
	  } else {
	    elem[evnt] = func;
	  }
	};

	exports['default'] = addEvent;
	module.exports = exports['default'];

/***/ }
/******/ ]);