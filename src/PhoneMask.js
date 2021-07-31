// import {phoneCodes} from './phoneCodes.js';
import formatRussianNumber from './utils/formatRussianNumber.js'
import preventInput from './utils/preventInput.js'
import { checkBlockOverflow, checkOverflow } from './utils/checkOverflow.js'

export default class PhoneMask {
  resultInput;
  cont;
  countryInput;
  phoneInput;
  countryLabel;
  phoneLabel;

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
    this.phoneLabel.appendChild(this.phoneInput);
  }

  setPhone = (value) => {
    this.phoneInput.value = value;
    this.updateResult();
  }

  setCountryCode(value) {
    this.countryInput.value = value;
    this.updateResult();
  }

  getResultValue() {
    return this.countryInput.value + ' ' + this.phoneInput.value;
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
  inputCountryHandler = (e) => {
    if(/\D/.test(e.data))
      this.setCountryCode(this.countryInput.value.replace(/\D/g, ''));
  }

  keydownHandler = (e) => {
    let cursorPos = this.phoneInput.selectionStart;
    if(cursorPos !== this.phoneInput.selectionEnd)
      return;

    // Removing - with not-numeric symbols delete next/prev number
    if(e.key === 'Backspace' && cursorPos && /\D/.test(this.phoneInput.value[cursorPos - 1])) {
      e.preventDefault();
      this.setPhone(this.phoneInput.value.substring(0, cursorPos - 2) + this.phoneInput.value.substring(cursorPos));
      this.inputPhoneHandler();
      this.phoneInput.selectionStart = this.phoneInput.selectionEnd = cursorPos - 2;
    }

    if(e.key === 'Delete' && /\D/.test(this.phoneInput.value[cursorPos])) {
      e.preventDefault();
      this.setPhone(this.phoneInput.value.substring(0, cursorPos - 2) + this.phoneInput.value.substring(cursorPos));
      this.inputPhoneHandler();
      this.phoneInput.selectionStart = this.phoneInput.selectionEnd = cursorPos + 1;
    }
  }

  inputPhoneHandler = (e) => {
    let numericValue = this.phoneInput.value.replace(/\D/g, '');
    if(!numericValue) return this.setPhone('');
    let cursorPos = this.phoneInput.selectionStart;

    // Inputting in end of line - just format
    if(this.phoneInput.value.length === cursorPos)
      return this.setPhone(formatRussianNumber(numericValue));

    // Prevent inputting not numeric symbols
    if(e && e.data && /\D/.test(e.data))
      return preventInput(this.phoneInput);

    // Fix blocks overflow
    if(checkBlockOverflow(this.phoneInput.value, cursorPos)) {
      if(checkOverflow(this.phoneInput.value))
        return preventInput(this.phoneInput);
      this.setPhone(formatRussianNumber(numericValue));
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
      this.setPhone(e.data);
      this.inputPhoneHandler(e);
    }
  }
}