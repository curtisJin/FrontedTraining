let element = document.documentElement; //Gets a reference to the root node of the document.

console.log(element);

//PC
element.addEventListener('mousedown', event => {
  start(event);

  let mouseMove = event => {
    move(event);
  }

  let mouseUp = event => {
    end(event);
    element.removeEventListener('mousemove', mouseMove);
    element.removeEventListener('mouseup', mouseUp);
  }

  element.addEventListener('mousemove', mouseMove);
  element.addEventListener('mouseup', mouseUp);
})

//mobile
element.addEventListener('touchstart', event => {
  for(let touch of event.changedTouches) {
    start(touch);
  }
})

element.addEventListener('touchmove', event => {
  for(let touch of event.changedTouches) {
    move(touch);
  }
})

element.addEventListener('touchend', event => {
  for(let touch of event.changedTouches) {
    end(touch);
  }
})

//Abnormal events will trigger cancel when touched,such as alert()
element.addEventListener('touchcancel', event => {
  for(let touch of event.changedTouches) {
    cancel(touch);
  }
})

//Abstract events on PC and Mobile
let start = (e) => {
  console.log('start', e);
}

let move = (e) => {
  console.log('move', e);
}

let end = (e) => {
  console.log('end', e);
}

let cancel = (e) => {
  console.log('cancel', e);
}