import FormValidation from './components/_FormValidation.es6.js';

(function(){

  'use strict';

  const validateForm = new FormValidation('sign-up-form', {
      username: {
          presence: true,
          length: {
              minimum: 3,
              maximum: 20
          },
          format: {
              pattern: '[a-z0-9]+',
              flags: 'i',
              message: 'Username must only contain a-z and 0-9'
          }
      },
      adminPassword: {
          presence: true,
          length: {
              minimum: 5,
              maximum: 70
          }
      },
      'confirmAdmin': {
          presence: true,
          equality: {
              attribute: 'adminPassword',
              message: '^The passwords does not match'
          }
      },

  });

})();
