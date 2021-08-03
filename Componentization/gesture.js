//Abstract events on PC and Mobile
export class Dispatcher {
  constructor(element) {
    this.element = element;
  }

  dispatch(type, properties, element) {
    let event = new Event(type);
  
    for (let name in properties) {
      event[name] = properties[name];
    }
  
    this.element.dispatchEvent(event);
  }
}

//listen => recognize => dispatch
// new Listener(new Recognize(dispatch))

export class Listener {
  constructor(element, recognizer) {
    let isListeningMouse = false;
    let contexts = new Map();
    //PC
    element.addEventListener("mousedown", (event) => {
      let context = Object.create(null);
      contexts.set("mouse" + (1 << event.button), context);
      recognizer.start(event, context);

      let mouseMove = (event) => {
        //The PC uses a mask to record which mouse buttons are pressed
        let button = 1;
        while (button <= event.buttons) {
          if (button && event.buttons) {
            let key;
            if (event.buttons === 2) {
              key = 4;
            } else if (event.buttons === 4) {
              key = 2;
            } else {
              key = button;
            }
            let context = contexts.get("mouse" + key);
            recognizer.move(event, context);
          }
          button = button << 1; //Recycle five masks
        }
      };

      let mouseUp = (event) => {
        let context = contexts.get("mouse" + (1 << event.button));
        recognizer.end(event, context);
        contexts.delete("mouse" + (1 << event.button));

        if (event.buttons === 0) {
          document.removeEventListener("mousemove", mouseMove);
          document.removeEventListener("mouseup", mouseUp);
          isListeningMouse = false;
        }
      };

      if (!isListeningMouse) {
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
        isListeningMouse = true;
      }
    });

    //mobile
    element.addEventListener("touchstart", (event) => {
      for (let touch of event.changedTouches) {
        //We distinguish the point created by the event by creating a context
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognizer.start(touch, context);
      }
    });

    element.addEventListener("touchmove", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.move(touch, context);
      }
    });

    element.addEventListener("touchend", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognizer.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });

    //Abnormal events will trigger cancel when touched,such as alert()
    element.addEventListener("touchcancel", (event) => {
      for (let touch of event.changedTouches) {
        recognizer.cancel(touch);
      }
    });
  }
}

export class Recognize {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  start(e, context) {
    context.points = [
      {
        t: Date.now(),
        x: e.clientX,
        y: e.clientY,
      },
    ];
    (context.startX = e.clientX), (context.startY = e.clientY);
    context.isPan = false;
    context.isTap = true;
    context.isPress = false;
    context.handler = setTimeout(() => {
      context.isPan = false;
      context.isTap = false;
      context.isPress = true;
      context.handler = null;
      this.dispatcher.dispatch("press", {});
    }, 500);
  }

  move(e, context) {
    let dx = e.clientX - context.startX,
      dy = e.clientY - context.startY;

    if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
      context.isPan = true;
      context.isTap = false;
      context.isPress = false;
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      this.dispatcher.dispatch("panStart", {
        startX: context.startX,
        startY: context.startY,
        clientX: e.clientX,
        clientY: e.clientY,
        isVertical: context.isVertical,
      });
      clearTimeout(context.handler);
    }

    if (context.isPan) {
      this.dispatcher.dispatch("pan", {
        startX: context.startX,
        startY: context.startY,
        clientX: e.clientX,
        clientY: e.clientY,
        isVertical: context.isVertical,
      });
    }

    // Use time less than points within 500 milliseconds
    context.points = context.points.filter(
      (point) => Date.now() - point.t < 500
    );

    context.points.push({
      t: Date.now(),
      x: e.clientX,
      y: e.clientY,
    });
  }

  end(e, context) {
    if (context.isTap) {
      this.dispatcher.dispatch("tap", {});
      clearTimeout(context.handler);
    } else if (context.isPress) {
      this.dispatcher.dispatch("pressend", {});
    }

    let d, v;
    context.points = context.points.filter(
      (point) => Date.now() - point.t < 500
    );
    if (!context.points.length) {
      v = 0;
    } else {
      d = Math.sqrt(
        (e.clientX - context.points[0].x) ** 2 +
          (e.clientY - context.points[0].y) ** 2
      );
      v = d / (Date.now() - context.points[0].t);
    }

    if (v > 1.5) {
      context.isFlick = true;
      this.dispatcher.dispatch("flick", {
        startX: context.startX,
        startY: context.startY,
        clientX: e.clientX,
        clientY: e.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v,
      });
    } else {
      context.isFlick = false;
    }

    if (context.isPan) {
      this.dispatcher.dispatch("panEnded", {
        startX: context.startX,
        startY: context.startY,
        clientX: e.clientX,
        clientY: e.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
      });
    }
  }

  cancel(e, context) {
    clearTimeout(context.handler);
    this.dispatcher.dispatch("cancel", {});
  }
}

export function enableGesture(element) {
  new Listener( element,new Recognize(new Dispatcher(element)));
}