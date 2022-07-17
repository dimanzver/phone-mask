import PhoneMask from './src/PhoneMask.js';

let input = document.getElementById('phone-input-js');
window.mask = new PhoneMask(input, {
    countryCode: 7,
    phone: 1234567890,
});
window.mask.on('change', console.log);