export default function (numericPhone) {
  let result = '';

  if(numericPhone.length > 0)
    result += numericPhone.substring(0, 3);

  if(numericPhone.length > 3)
    result += ' ' + numericPhone.substring(3, 6);

  if(numericPhone.length > 6)
    result += '-' + numericPhone.substring(6, 8);

  if(numericPhone.length > 8)
    result += '-' + numericPhone.substring(8, 10);

  return result;
}