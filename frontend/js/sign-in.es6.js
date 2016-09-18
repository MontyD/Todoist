import FormValidation from './components/_FormValidation.es6.js';
import Menu from './components/_menu.es6.js';

(function() {

  'use strict';

  let constraints = {
    name: {
        presence: true,
        length: {
            minimum: 3,
            maximum: 20
        },
        format: {
            pattern: '[a-z0-9]+',
            flags: 'i',
            message: '^Your name must only contain only letters or numbers (no spaces)'
        }
    },
    username: {
      presence: true,
      length: {
          minimum: 4,
          maximum: 20
      },
      format: {
          pattern: '[a-z0-9]+',
          flags: 'i',
          message: '^Room names only contain letters or numbers (no spaces)'
      }
    },
    password: {
        length: {
            minimum: 3,
            maximum: 20
        },
        presence: true,
    },
  };

  const validateForm = new FormValidation('sign-in-form', constraints);

  const menuToggle = new Menu('menu', ['close-menu']);


})();
