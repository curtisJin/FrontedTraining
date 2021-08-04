
import { createElement } from './framework'
import { Carousel } from './carousel';
import { List } from './List.js';

let pic = [
  {
    img: "https://t7.baidu.com/it/u=655876807,3707807800&fm=193&f=GIF",
    url: "https://www.baidu.com"
  },
  {
    img: "https://t7.baidu.com/it/u=3094554900,3238926176&fm=193&f=GIF",
    url: "https://www.baidu.com"
  },
  {
    img: "https://t7.baidu.com/it/u=3980489931,4090080080&fm=193&f=GIF",
    url: "https://www.baidu.com"
  },
  {
    img: "https://t7.baidu.com/it/u=4273336377,2981498573&fm=193&f=GIF",
    url: "https://www.baidu.com"
  }
]
/*
let a = <Carousel
  src = {pic}
  onChange = {event => {
    console.log(event.detail.position);
  }}
  onClick = { event => window.location.href = event.detail.data.url}
/>;
*/

let a = <List data={pic}>
  {
    (record) => {
      <div>
        <img src={record.img}></img>
      <a href={record.url}></a>
      </div>
    }
  }
</List>
a.mountTo(document.body);

// let tl = new Timeline();
// window.tl = tl;
// window.animation = new Animation({set a(v) { console.log(v) }}, 'a', 0, 100, 1000, null);

// tl.start();

// var a = createElement("div", {
//   id: "test"
// }, createElement("span", null), createElement("span", null));

