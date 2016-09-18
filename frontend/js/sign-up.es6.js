import FormValidation from './components/_FormValidation.es6.js';
import Menu from './components/_menu.es6.js';

(function() {

    'use strict';

    let constraints = {
        username: {
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
        name: {
            presence: true,
            length: {
                minimum: 4,
                maximum: 20
            },
            format: {
                pattern: '[a-z0-9]+',
                flags: 'i',
                message: '^Room name must only contain only letters or numbers (no spaces)'
            },
            exclusion: ['rooms', 'settings', 'overview', 'index', 'todo-lists'],
            nameUnique: true
        },
        passcode: {
            length: {
                minimum: 5,
                maximum: 70
            },
            presence: true,
            equality: {
                attribute: 'adminPassword',
                message: '^Passcode must not match admin password',
                comparator: function(v1, v2) {
                    return v1 !== v2;
                }
            }
        },
        adminPassword: {
            presence: true,
            length: {
                minimum: 5,
                maximum: 70
            }
        },
        confirmAdmin: {
            presence: true,
            equality: {
                attribute: 'adminPassword',
                message: '^Passwords do not match'
            }
        }
    };

    if (navigator.userAgent.indexOf('MSIE') === -1 && navigator.userAgent.indexOf('rv:11.0') === -1) {
      const validateForm = new FormValidation('sign-up-form', constraints);
    }
    const menuToggle = new Menu('menu', ['close-menu']);

})();
