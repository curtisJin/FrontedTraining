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
  for(let child of children) {
    //Processing text nodes
    if(typeof child === 'string') {
      child = new TextWrapper(child);
    }
    element.appendChild(child);
  }

  return element;
}

export class Component {
  constructor(type) {}
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class ElementWrapper extends Component{
  constructor(type) {
    this.root = document.createElement(type);
  }
  
}

class TextWrapper extends Component{
  constructor(content) {
    this.root = document.createTextNode(content);
  }
}