import { Component } from './framework';

export class Carousel extends Component{
  
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  render() {
    this.root = document.createElement('div');
    this.root.classList.add('carousel');
    for(let record of this.attributes.src) {
      //To prevent dragging, Use div
      let child = document.createElement("div");
      child.style.backgroundImage = `url(${record})`;
      this.root.appendChild(child);
    }
    
    // let currentIndex = 0;
    // setInterval(() => {
    //   let children = this.root.children;
    //   let nextIndex = (currentIndex + 1) % children.length;

    //   let current = children[currentIndex];
    //   let next = children[nextIndex];
      
    //   next.style.transition = "none";
    //   next.style.transform = `translateX(${100 - nextIndex * 100}%)`;
      
    //   setTimeout(() => {
    //     next.style.transition = "";
    //     current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
    //     next.style.transform = `translateX(${- nextIndex * 100}%)`;
    //     currentIndex = nextIndex;
    //   }, 16);
    //   // ++current;
    //   //In order to cycle between 1~n,use the remainder operation in mathematics.
    //   // current = current % children.length;

    //   for(let child of children) {
    //     child.style.transform = `translateX(-${100 * current}%)`;
    //   }
    // }, 3000)
   
    let position = 0;

    this.root.addEventListener("mousedown", (event) => {
      let children = this.root.children;
      //The starting X coordinate after the mouse click
      let startX = event.clientX;
      let mouseMove = (event) => {
        //Get the horizontal distance of the mouse movement
        let x = event.clientX - startX;
        //The position of the current element
        let current = position - ((x - x % 900) / 900);
        
        for(let offset of [-1, 0, 1]) {
          let pos = current + offset;
          pos = (pos + children.length) % children.length;
          children[pos].style.transition = 'none';
          children[pos].style.transform = `translateX(${- pos * 900 + offset * 900 + x % 900}px)`;
        }
      }

      let mouseUp = (event) => {
        let x = event.clientX - startX;
        position = position - Math.round(x / 900);
        
        for(let offset of [0, - Math.sign(Math.round(x / 900) - x + 450 * Math.sign(x))]) {
          let pos = position + offset;
          pos = (pos + children.length) % children.length;
          children[pos].style.transition = '';
          children[pos].style.transform = `translateX(${- pos * 900 + offset * 900}px)`;
        }
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
      }

      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    })
    
    return this.root;
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
}
