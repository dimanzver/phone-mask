import PhoneMask from './src/PhoneMask.js';

let input = document.getElementById('phone-input-js');
window.mask = new PhoneMask(input);
window.mask.on('change', console.log);