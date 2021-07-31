export default function (input, inputtedLength = 1) {
  let cursorPos = input.selectionStart;
  input.value = input.value.substring(0, cursorPos - inputtedLength) + input.value.substring(cursorPos);
  input.selectionStart = input.selectionEnd = cursorPos - inputtedLength;
}