export { msToTime, uuidv4 };

function msToTime(duration: number) {
  const milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let _hours, _minutes, _seconds;
  _hours = hours < 10 ? '0' + hours : hours;
  _minutes = minutes < 10 ? '0' + minutes : minutes;
  _seconds = seconds < 10 ? '0' + seconds : seconds;

  return _hours + 'h:' + _minutes + 'm:' + _seconds + '.' + milliseconds;
}

function uuidv4() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
    const randomValue = crypto.getRandomValues(new Uint8Array(1))[0];
    const shiftedValue = 15 >> (Number(c) / 4);
    return (parseInt(c) ^ (randomValue & shiftedValue)).toString(16);
  });
}
