// use JS to realize animation,the most important thing is the concept of framework
// Three ways to implement animation in JS
  // setInterval(() => {}, 16);

  // let tick = () => {
    // setTimeout(tick, 16);
    // }

  // let tick = () => {
    // let handle = requestAnimationFrame(tick);      recommended use
    // cancelAnimationFrame(handle);
    // }

//We use Symbol constants to make the tick method unique and not arbitrary modified

const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');

export class Timeline {
  
  constructor() { 
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
  }

  start() {
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      let now = Date.now();
      
      for(let animation of this[ANIMATIONS]) {
        let t;

        if(this[START_TIME].get(animation) < startTime) {
          t = now - startTime - this[PAUSE_TIME];
        } else {
          t = now - this[START_TIME].get(animation) - this[PAUSE_TIME];
        }

        if(animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          t = animation.duration;
        }
        animation.receiveTime(t);
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    }

    this[TICK]();
  }

  pause() {
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }

  resume() {
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  }

  add(animation, startTime) {
    if(arguments.length < 2) {
      startTime = Date.now();
    }
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, startTime);
  }
}

export class Animation {
  constructor(object, property, startValue, endValue, duration, delay,timingFunction , template) {
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction;
    this.delay = delay;
    this.template = template;
  }

  receiveTime(time) {
    let range = this.endValue - this.startValue;
    this.object[this.property] = this.template(this.startValue + range * time / this.duration);
  }
}