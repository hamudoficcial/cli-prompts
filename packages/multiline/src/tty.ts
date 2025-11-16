function enableBracketedPaste() {
  process.stdout.write('\x1b[?2004h');
}

function disableBracketedPaste() {
  process.stdout.write('\x1b[?2004l');
}

export function enableRawMode() {
  enableBracketedPaste();
  process.stdin.setRawMode(true);
}

export function disableRawMode() {
  disableBracketedPaste();
  process.stdin.setRawMode(false);
}
