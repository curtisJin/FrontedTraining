import { Timeline, Animation } from './animation.js';
//if type=module is used in the html file,the file suffix .js must be added when importing

import { ease, easeInOut, easeIn } from './ease.js';

let tl = new Timeline();

tl.start();

tl.add(new Animation(document.getElementById('el').style, 'transform', 0, 500, 3000, 0, easeIn, v => `translateX(${v}px)`));

document.getElementById('pause').addEventListener('click', () => tl.pause());
document.getElementById('resume').addEventListener('click', () => tl.resume());