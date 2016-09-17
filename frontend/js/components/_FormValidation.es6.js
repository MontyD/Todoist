import validate from 'validate.js';
import addEvent from './_addEvent.es6.js';

validate.validators.nameUnique = function(value) {
    'use strict';
    return new validate.Promise(function(resolve, reject) {
        if (!value) {
            resolve();
        } else {

            let request = new XMLHttpRequest();
            addEvent('load', request, function() {
                let result = JSON.parse(this.responseText);
                if (result) {
                    resolve();
                } else {
                    resolve('Sorry, that name is already taken');
                }
            });
            addEvent('error', request, function() {
                reject();
            });
            addEvent('abort', request, function() {
                reject();
            });
            request.open('GET', '/rooms/is-unique?name=' + value, true);
            request.setRequestHeader('Accept', 'application/json');
            request.send();
        }
    });
};

class FormValidation {

    constructor(formId, constraints) {

        this.formId = formId;

        this.constraints = constraints;

        this.form = document.getElementById(this.formId);

        this.inputs = [];

        this.errors = {};

        this.init();

    }

    init() {

        if (!this.form || !this.inputs) {
            console.warn('Could not attach to form: ' + this.formId);
            return false;
        }

        this.inputs = Array.prototype.slice.call(this.form.querySelectorAll('input, textarea, select'));

        addEvent('submit', this.form, (function(ev) {
            ev.preventDefault();
            this.handleSubmission();
            return false;
        }).bind(this));

        this.form.noValidate = true;

        this.inputs.forEach(el => {
            addEvent('change', el, (function(evt) {
                evt.preventDefault();
                this.validateInput(el);
            }).bind(this));
        }, this);

    }

    validateInput(element) {
        this.errors = validate.async(this.form, this.constraints || {}).then(
            success => {},
            function(errors){
                if (errors instanceof Error) {
                    throw errors;
                }
                this.errors = errors;
                this.showErrorsForInput(element, this.errors[element.name]);
            }.bind(this)
        );
    }

    showErrorsForInput(element, errors) {
        this.resetErrors(element);
        if (errors) {
            element.className = element.className + ' error';
            errors.forEach(error => this.addErrorsToElement(element, error), this);
        } else {
            element.className = element.className + ' valid';
        }
    }

    addErrorsToElement(element, error) {
        let errorEl = document.createElement('p');
        errorEl.className = 'error error-' + element.id;
        errorEl.innerText = error;
        element.parentNode.insertBefore(errorEl, element.nextSibling);
    }

    resetErrors(element) {
        let errorsClass = 'error-' + element.id;
        let errorMessages = Array.prototype.slice.call(this.form.getElementsByClassName(errorsClass));
        errorMessages.forEach(el => {
            el.parentNode.removeChild(el);
        }, this);
        element.className = element.className.replace(' error', '');
    }

    showAllErrors() {
        this.inputs.forEach(el => {
            if (this.errors[el.name]) {
                this.showErrorsForInput(el, this.errors[el.name]);
            }
        });
    }

    handleSubmission() {
      this.errors = validate.async(this.form, this.constraints || {}).then(
          function() {
            this.form.submit();
          }.bind(this),
          function(errors){
              if (errors instanceof Error) {
                  throw errors;
              }
              this.errors = errors;
              this.showAllErrors();
          }.bind(this)
      );
    }
}

export default FormValidation;
