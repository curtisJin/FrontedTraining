import CubicBezier from './node_modules/cubic-bezier-easing/index.js';

export let linear = v => v;

export let ease = new CubicBezier(0.25, 0.1, 0.25, 1);
export let easeIn = new CubicBezier(0.42, 0, 1, 1);
export let easeOut = new CubicBezier(0, 0, .58, 1);
export let easeInOut = new CubicBezier(.42, 0, .58, 1);