export function checkBlockOverflow (value, cursorPos) {
  if(cursorPos < 5)
    return (value.match(/^\d+/) || [''])[0].length > 3;

  if(cursorPos < 9)
    return (value.match(/^(\d){3}\s\d+/) || [''])[0].length > 7;

  if(cursorPos < 13)
    return (value.match(/^(\d){3}\s(\d){3}-\d+/) || [''])[0].length > 10;

  return value.length > 13;
}

export function checkOverflow(value) {
  return value.replace(/\D/g, '').length > 10;
}