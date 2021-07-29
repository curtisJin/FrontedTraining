let element = document.documentElement; //Gets a reference to the root node of the document.

let isListeningMouse = false;

//PC
element.addEventListener('mousedown', event => {
  let context = Object.create(null);
  contexts.set('mouse'+ (1 << event.button), context);
  start(event, context);
  
  let mouseMove = event => {
    //The PC uses a mask to record which mouse buttons are pressed
    let button = 1;
    while(button <= event.buttons) {
      if(button && event.buttons) {
        let key;
        if(event.buttons === 2) {
          key = 4;
        } else if(event.buttons === 4) {
          key = 2;
        } else {
          key = button;
        }
        let context = contexts.get('mouse' + key);
        move(event, context);
      }
      button = button << 1; //Recycle five masks
    }
  }

  let mouseUp = event => {
    let context = contexts.get('mouse' + (1 << event.button));
    end(event, context);
    contexts.delete('mouse' + (1 << event.button));

    if(event.buttons === 0) {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
      isListeningMouse = false;
    }
  }

  if(!isListeningMouse) {
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
    isListeningMouse = true;
  }
})

//mobile
let contexts = new Map();

element.addEventListener('touchstart', event => {
  for(let touch of event.changedTouches) {
    //We distinguish the point created by the event by creating a context
    let context = Object.create(null);
    contexts.set(touch.identifier, context);
    start(touch, context);
  }
})

element.addEventListener('touchmove', event => {
  for(let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    move(touch, context);
  }
})

element.addEventListener('touchend', event => {
  for(let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    end(touch, context);
    contexts.delete(touch.identifier);
  }
})

//Abnormal events will trigger cancel when touched,such as alert()
element.addEventListener('touchcancel', event => {
  for(let touch of event.changedTouches) {
    cancel(touch);
  }
})

//Abstract events on PC and Mobile
let handler;
let startX, startY;
let isPan = false;
let isTap = true;
let isPress = false;

let start = (e, context) => {
  
  context.startX = e.clientX, context.startY = e.clientY;
  context.isPan = false;
  context.isTap = true;
  context.isPress = false;
  context.handler = setTimeout(() => {
    context.isPan = false;
    context.isTap = false;
    context.isPress = true;
    context.handler = null;
    console.log('press');
  }, 500);
}

let move = (e, context) => {
  let dx = e.clientX - context.startX, dy = e.clientY - context.startY;

  if(!context.isPan && dx ** 2 + dy ** 2 > 100) {
    context.isPan = true;
    context.isTap = false;
    context.isPress = false;
    console.log('panStart');
    clearTimeout(context.handler);
  }

  if(context.isPan) {
    console.log(dx, dy);
    console.log('pan');
  }

}

let end = (e, context) => {
  if(context.isTap) {
    dispatch('tap', {});
    clearTimeout(context.handler);
  } else if(context.isPan) {
    console.log('panEnded');
  } else if(context.isPress) {
    console.log('pressend');
  }
}

let cancel = (e, context) => {
  clearTimeout(context.handler);
}


function dispatch (type, properties) {
  let event = new Event(type);
  
  for(let name in properties) {
    event[name] = properties[name];
  }

  element.dispatchEvent(event);
}