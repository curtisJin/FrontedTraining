
import { Component, createElement } from './framework'
class Carousel extends Component{
  
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
   
    this.root.addEventListener("mousedown", (event) => {
      let mouseMove = (enevt) => {
        console.log(2,event);
      }

      let mouseUp = (enevt) => {
        console.log(3, event);
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


let pic = [
  "https://t7.baidu.com/it/u=655876807,3707807800&fm=193&f=GIF",
  "https://t7.baidu.com/it/u=3094554900,3238926176&fm=193&f=GIF",
  "https://t7.baidu.com/it/u=3980489931,4090080080&fm=193&f=GIF",
  "https://t7.baidu.com/it/u=4273336377,2981498573&fm=193&f=GIF"
]

let a = <Carousel
  src = {pic}
/>;

a.mountTo(document.body);

// var a = createElement("div", {
//   id: "test"
// }, createElement("span", null), createElement("span", null));

