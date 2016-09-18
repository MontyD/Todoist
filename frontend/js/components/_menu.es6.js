import addEvent from './_addEvent.es6.js';


class Menu {

  constructor(openMenuClass = 'menu', closeMenuIDs = ['overlay']) {

    this.body = document.body || document.getElementsByTagName('body')[0];

    this.elements = Array.prototype.slice.call(document.getElementsByClassName(openMenuClass));

    this.closeMenuElements = closeMenuIDs.map(ID => document.getElementById(ID));

    this.placeListeners();
  }

  placeListeners() {
    this.elements.forEach(el => addEvent('click', el, this.toggleMenu.bind(this)), this);
    this.closeMenuElements.forEach(el => addEvent('click', el, this.closeMenu.bind(this)), this);
  }

	toggleMenu(e, close) {
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

  closeMenu(e) {
    var evt = e || window.event;
    if (evt.preventDefault) {
      evt.preventDefault();
    } else {
      evt.returnValue = false;
    }
    this.toggleMenu(null, true);
  }

}

export default Menu;
