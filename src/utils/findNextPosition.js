export default function (value, startPos, direction = 1) {
  let pos = startPos;
  while (value.length > pos) {
    if(/\d/.test(value[pos]))
      return pos;
    pos += direction;
  }
  return -1;
}