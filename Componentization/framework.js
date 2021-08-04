export function createElement (type, attributes, ...children) {
  //Create dom elements of the same type
  let element;
  //Handling element case
  if(typeof type === 'string') {
    element = new ElementWrapper(type);
  } else {
    //When the element is uppercase
    element = new type;
  }
  //Add attributes to elements
  for(let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }

  //Add childrens to elements
  let progressChildren = (children) => {
    for(let child of children) {
      if(!child) return;
      if((typeof child === 'object') && (child instanceof Array)) {
        progressChildren(child);
        continue;
      }
      //Processing text nodes
      if(typeof child === 'string') {
        child = new TextWrapper(child);
      }
      console.log(child);
      element.appendChild(child);
    }
  }
  progressChildren(children);
  return element;
}

export const STATE = Symbol('state');
export const ATTRIBUTE = Symbol('attribute');

export class Component {
  constructor(type) {
    this[ATTRIBUTE] = Object.create(null);
    this[STATE] = Object.create(null);
  }
  render() {
    return this.root;
  };
  
  setAttribute(name, value) {
    this[ATTRIBUTE][name] = value;
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    if(!this.root) {
      this.render();
    }
    parent.appendChild(this.root);
  }
  triggerEvent(type, args) {
    this[ATTRIBUTE]['on' + type.replace(/^[\s\S]/, s => s.toUpperCase())](new CustomEvent(type, { detail: args }));
  }
}

class ElementWrapper extends Component{
  constructor(type) {
    super();
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  
}

class TextWrapper extends Component{
  constructor(content) {
    super();
    this.root = document.createTextNode(content);
  }
}