// import {phoneCodes} from './phoneCodes.js';
import formatRussianNumber from './utils/formatRussianNumber.js'
import preventInput from './utils/preventInput.js'
import { checkBlockOverflow, checkOverflow } from './utils/checkOverflow.js'
import findNextPosition from './utils/findNextPosition.js';

export default class PhoneMask {
  resultInput;
  cont;
  countryInput;
  phoneInput;
  countryLabel;
  phoneLabel;
  listeners = {
    change: [],
  };

  constructor (input) {
    this.resultInput = input;
    this.cont = input.parentNode;
    this.initHtml();
    this.initMask();
  }

  destroy() {
    this.countryInput.removeEventListener('input', this.inputCountryHandler);
    this.countryInput.removeEventListener('blur', this.blurCountryHandler);
    this.phoneInput.removeEventListener('input', this.inputPhoneHandler);
    this.phoneInput.removeEventListener('paste', this.pasteHandler);
    this.phoneInput.removeEventListener('keydown', this.keydownHandler);
    this.cont.removeChild(this.countryLabel);
    this.cont.removeChild(this.phoneLabel);
    this.countryInput = this.phoneInput = this.countryLabel = this.phoneInput = null;
  }

  initHtml = () => {
    this.countryLabel = document.createElement('label');
    this.countryLabel.innerHTML = '<span class="ipi-plus">+</span>';
    this.cont.appendChild(this.countryLabel);
    this.countryInput = document.createElement('input');
    this.countryInput.maxLength = 3;
    this.countryInput.className = 'ipi-country-input';
    this.countryInput.value = 7;
    this.countryLabel.appendChild(this.countryInput);

    this.phoneLabel = document.createElement('label');
    this.cont.appendChild(this.phoneLabel);
    this.phoneInput = document.createElement('input');
    this.phoneInput.maxLength = 15;
    this.phoneInput.className = 'ipi-phone-input';
    this.phoneInput.type = 'tel';
    this.phoneInput.value = formatRussianNumber(
      this.resultInput.value.replace(/^\+7/, '').replace(/\D/g, '')
    );
    this.phoneLabel.appendChild(this.phoneInput);
  }

  on = (event, callback) => {
     if(this.listeners[event])
       this.listeners[event].push(callback);
  }

  trigger = (event, payload) => {
    if(this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(payload));
    }
  }

  setPhone = (value, filtered = true) => {
    this.phoneInput.value = filtered ? formatRussianNumber(value) : value;
    this.updateResult();
    this.trigger('change', this.getResultValue());
  }

  setCountryCode(value) {
    this.countryInput.value = value;
    this.updateResult();
    this.trigger('change', this.getResultValue());
  }

  getResultValue() {
    return '+' + this.countryInput.value + ' ' + this.phoneInput.value;
  }

  updateResult = () => {
    this.resultInput.value = this.getResultValue();
  }

  initMask = () => {
    this.countryInput.addEventListener('input', this.inputCountryHandler);
    this.countryInput.addEventListener('blur', this.blurCountryHandler);
    this.phoneInput.addEventListener('input', this.inputPhoneHandler);
    this.phoneInput.addEventListener('paste', this.pasteHandler);
    this.phoneInput.addEventListener('keydown', this.keydownHandler);
  }

  // Default country code is russian (7)
  blurCountryHandler = () => {
    if(!this.countryInput.value)
      this.setCountryCode(7);
  }

  // Country code - only numbers
  inputCountryHandler = () => {
    this.setCountryCode(this.countryInput.value.replace(/\D/g, ''));
  }

  keydownHandler = (e) => {
    let cursorPos = this.phoneInput.selectionStart;
    if(cursorPos !== this.phoneInput.selectionEnd)
      return;

    // Removing - with not-numeric symbols delete next/prev number
    if(e.key === 'Backspace' && cursorPos && /\D/.test(this.phoneInput.value[cursorPos - 1])) {
      e.preventDefault();
      let prevPos = findNextPosition(this.phoneInput.value, cursorPos - 1, -1);
      this.setPhone(this.phoneInput.value.substring(0, prevPos) + this.phoneInput.value.substring(prevPos + 1), false);
      this.inputPhoneHandler();
      this.phoneInput.selectionStart = this.phoneInput.selectionEnd = prevPos;
    }

    if(e.key === 'Delete' && /\D/.test(this.phoneInput.value[cursorPos])) {
      e.preventDefault();
      let nextPos = findNextPosition(this.phoneInput.value, cursorPos);
      this.setPhone(this.phoneInput.value.substring(0, nextPos) + this.phoneInput.value.substring(nextPos + 1), false);
      this.inputPhoneHandler();
      this.phoneInput.selectionStart = this.phoneInput.selectionEnd = nextPos;
    }
  }

  inputPhoneHandler = (e) => {
    let numericValue = this.phoneInput.value.replace(/\D/g, '');
    if(!numericValue) return this.setPhone('');
    let cursorPos = this.phoneInput.selectionStart;

    // Inputting in end of line - just format
    if(this.phoneInput.value.length === cursorPos)
      return this.setPhone(formatRussianNumber(numericValue), false);

    // Prevent inputting not numeric symbols
    if(e && e.data && /\D/.test(e.data))
      return preventInput(this.phoneInput);

    // Fix blocks overflow
    if(checkBlockOverflow(this.phoneInput.value, cursorPos)) {
      if(checkOverflow(this.phoneInput.value))
        return preventInput(this.phoneInput);
      this.setPhone(formatRussianNumber(numericValue), false);
      let newPos = /\d/.test(this.phoneInput.value[cursorPos - 1]) ? cursorPos : cursorPos + 1;
      this.phoneInput.selectionStart = this.phoneInput.selectionEnd = newPos;
    }
  }

  pasteHandler = (e) => {
    e.preventDefault();
    let pasted = e.clipboardData || window.clipboardData;
    // On paste - clear and set pasted value
    if(pasted) {
      e.data = pasted.getData('Text').replace(/\D/g, '');
      e.data = e.data.replace(new RegExp('^(' + this.countryInput.value + '|8)'), '');
      this.setPhone(e.data, false);
      this.inputPhoneHandler(e);
    }
  }
}