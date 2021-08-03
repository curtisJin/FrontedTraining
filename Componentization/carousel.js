import { Component } from "./framework.js";
import { enableGesture } from "./gesture.js";
import { Timeline, Animation } from "./animation.js";
import { ease } from "./ease.js";

export class Carousel extends Component {
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  render() {
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for (let record of this.attributes.src) {
      //To prevent dragging, Use div
      let child = document.createElement("div");
      child.style.backgroundImage = `url(${record})`;
      this.root.appendChild(child);
    }

    //Add gesture function to the root node
    enableGesture(this.root);
    //Initialize the timeline
    let timeline = new Timeline;
    timeline.start();

    let children = this.root.children;

    let position = 0;

    let t = 0;
    let ax = 0;

    let handler = null;

    this.root.addEventListener("pan", (event) => {
      timeline.pause();
      clearInterval(handler);
      let progress = (Date.now() - t) / 1500;
      ax = ease(progress) * 900 - 900;
    });

    this.root.addEventListener("pan", (event) => {
      let x = event.clientX - event.startX - ax;

      let current = position - (x - (x % 900)) / 900;

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

      let current = position - (x - (x % 900)) / 900;

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

      position = position - ((x - x % 900) / 900) - direction;
      position = (position % children.length + children.length) % children.length;
    });

    let nextPic = () => {
      let children = this.root.children;
      let nextIndex = (position + 1) % children.length;

      let current = children[position];
      let next = children[nextIndex];

      t = Date.now();

      next.style.transition = "none";
      next.style.transform = `translateX(${900 - nextIndex * 900}px)`;

      //current
      timeline.add(new Animation(
        current.style,
        "transform",
        - position * 900,
        - 900 - position * 900,
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

      position = nextIndex;

    }

    handler = setInterval(nextPic, 3000);

    // this.root.addEventListener("mousedown", (event) => {
    //   let children = this.root.children;
    //   //The starting X coordinate after the mouse click
    //   let startX = event.clientX;
    //   let mouseMove = (event) => {
    //     //Get the horizontal distance of the mouse movement
    //     let x = event.clientX - startX;
    //     //The position of the current element
    //     let current = position - ((x - x % 900) / 900);

    //     for(let offset of [-1, 0, 1]) {
    //       let pos = current + offset;
    //       pos = (pos + children.length) % children.length;
    //       children[pos].style.transition = 'none';
    //       children[pos].style.transform = `translateX(${- pos * 900 + offset * 900 + x % 900}px)`;
    //     }
    //   }

    //   let mouseUp = (event) => {
    //     let x = event.clientX - startX;
    //     position = position - Math.round(x / 900);

    //     for(let offset of [0, - Math.sign(Math.round(x / 900) - x + 450 * Math.sign(x))]) {
    //       let pos = position + offset;
    //       pos = (pos + children.length) % children.length;
    //       children[pos].style.transition = '';
    //       children[pos].style.transform = `translateX(${- pos * 900 + offset * 900}px)`;
    //     }
    //     document.removeEventListener("mousemove", mouseMove);
    //     document.removeEventListener("mouseup", mouseUp);
    //   }

    //   document.addEventListener('mousemove', mouseMove);
    //   document.addEventListener('mouseup', mouseUp);
    // })

    return this.root;
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
}
