import { Component, STATE, ATTRIBUTE } from "./framework.js";
import { enableGesture } from "./gesture.js";
import { Timeline, Animation } from "./animation.js";
import { ease } from "./ease.js";

export { STATE, ATTRIBUTE } from './framework.js';

export class Carousel extends Component {
  constructor() {
    super();  
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for (let record of this[ATTRIBUTE].src) {
      //To prevent dragging, Use div
      let child = document.createElement("div");
      child.style.backgroundImage = `url(${record.img})`;
      this.root.appendChild(child);
    }

    //Add gesture function to the root node
    enableGesture(this.root);
    //Initialize the timeline
    let timeline = new Timeline;
    timeline.start();

    let children = this.root.children;

    this[STATE].position = 0;

    let t = 0;
    let ax = 0;

    let handler = null;

    this.root.addEventListener("pan", (event) => {
      timeline.pause();
      clearInterval(handler);
      let progress = (Date.now() - t) / 1500;
      ax = ease(progress) * 900 - 900;
    });

    this.root.addEventListener("tap", (event) => {
      this.triggerEvent('click', { 
        data: this[ATTRIBUTE].src[this[STATE].position],
        position: this[STATE].position 
      })
    });

    this.root.addEventListener("pan", (event) => {
      let x = event.clientX - event.startX - ax;

      let current = this[STATE].position - (x - (x % 900)) / 900;

      for (let offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = (pos % children.length + children.length) % children.length;
        children[pos].style.transition = "none";
        children[pos].style.transform = `translateX(${
          -pos * 900 + offset * 900 + (x % 900)
        }px)`;
      }
    });

    this.root.addEventListener("panEnded", (event) => {
      timeline.reset();
      timeline.start();
      handler = setInterval(nextPic, 3000);
      
      let x = event.clientX - event.startX - ax;

      let current = this[STATE].position - (x - (x % 900)) / 900;

      let direction = Math.round((x % 900) / 900);

      if(event.isFlick) {
        console.log(event)
      }
      for (let offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = (pos % children.length + children.length) % children.length;

        children[pos].style.transition = "none";

        timeline.add(new Animation(
          children[pos].style,
          "transform",
          -pos * 900 + offset * 900 + (x % 900),
          -pos * 900 + offset * 900 + direction * 900,
          1500,
          0,
          ease,
          v => `translateX(${v}px)`
        ));
      }

      this[STATE].position = this[STATE].position - ((x - x % 900) / 900) - direction;
      this[STATE].position = (this[STATE].position % children.length + children.length) % children.length;
      this.triggerEvent('change', { position: this[STATE].position})
    });

    let nextPic = () => {
      let children = this.root.children;
      let nextIndex = (this[STATE].position + 1) % children.length;

      let current = children[this[STATE].position];
      let next = children[nextIndex];

      t = Date.now();

      next.style.transition = "none";
      next.style.transform = `translateX(${900 - nextIndex * 900}px)`;

      //current
      timeline.add(new Animation(
        current.style,
        "transform",
        - this[STATE].position * 900,
        - 900 - this[STATE].position * 900,
        1500,
        0,
        ease,
        v => `translateX(${v}px)`
      ));
      //next
      timeline.add(new Animation(
        next.style,
        "transform",
        900 - nextIndex * 900,
        - nextIndex * 900,
        1500,
        0,
        ease,
        v => `translateX(${v}px)`
      ));

      this[STATE].position = nextIndex;
      this.triggerEvent('Change', { position: this[STATE].position});

    }

    handler = setInterval(nextPic, 3000);

    return this.root;
  }
}
