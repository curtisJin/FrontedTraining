import HelloWorld from './HelloWord.vue';
import Vue from 'Vue';

new Vue({
  el: '#app',
  render: b => b(HelloWorld)
})