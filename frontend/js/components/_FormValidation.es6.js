import validate from 'validate.js';
import addEvent from './_addEvent.es6.js';

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
      this.errors = validate(this.form, this.constraints) || {};
      this.showErrorsForInput(element, this.errors[element.name]);
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
      this.errors = validate(this.form, this.constraints);
      if (this.errors) {
        this.showAllErrors();
      } else {
        this.form.submit();
      }
    }

}

export default FormValidation;
