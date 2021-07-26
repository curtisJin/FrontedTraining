
import { Component, createElement } from './framework'
import { Carousel } from './carousel';
import { Timeline, Animation } from './animation';

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

let tl = new Timeline();
window.tl = tl;
window.animation = new Animation({set a(v) { console.log(v) }}, 'a', 0, 100, 1000, null);

tl.start();

// var a = createElement("div", {
//   id: "test"
// }, createElement("span", null), createElement("span", null));

