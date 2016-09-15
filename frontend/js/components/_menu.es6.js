import addEvent from './_addEvent.es6.js';


class Menu {

  constructor(className = 'menu') {

    this.elements = document.getElementsByTagName(className);

    this.body = document.body || document.getElementsByTagName('body')[0];

    for (var i = 0; i < this.elements.length; i++) {
      addEvent('click', this.element[i], this.menuOnClick);
    }

    addEvent('click', document.getElementById('overlay'), this.closeMenu);

    addEvent('click', document.getElementById('closeMenu'), this.closeMenu);


  }

	menuOnClick(e, close) {
		if (!close) {
			var evt = e || window.event;
			if (evt.preventDefault) {
				evt.preventDefault();
			} else {
				evt.returnValue = false;
			}
		}

		if (this.body.className.indexOf(' menuOpen') > -1 || close) {
			this.body.className = this.body.className.replace(' menuOpen', '');
		} else {
			this.body.className += ' menuOpen';
		}

	}

  closeMenu(e) {
    var evt = e || window.event;
    if (evt.preventDefault) {
      evt.preventDefault();
    } else {
      evt.returnValue = false;
    }
    this.menuOnClick(null, true);
  }

}

export default Menu;
