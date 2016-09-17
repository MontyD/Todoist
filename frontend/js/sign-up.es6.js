import validate from 'validate.js';
import addEvent from './components/_addEvent.es6.js';

class ValidateForm {

    constructor(formId, constraints) {

        this.formId = formId;

        this.constraints = constraints;

        this.form = document.getElementById('formId');

        this.inputs = Array.prototype.slice.call(this.form.querySelectorAll('input, textarea, select'));

        this.errors = {};

    }

    init() {

        if (!this.form || !this.inputs) {
            console.warn('Could not attach to form: ' + this.formId);
            return false;
        }

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
      
    }

    handleSubmission() {

    }







}
