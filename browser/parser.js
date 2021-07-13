const css = require("css");
const layout = require('./layout');
let currentToken = null;
let currentAttribute = null;

//创建一个根结点，避免出栈以后为空的情况
let stack = [{ type: "document", children: [] }];
let currentTextNode = null;

//把css规则暂存在一个数组里面
let rules = [];
function addCssRules(text) {
  var ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
  if (!selector || !element.attribute) return false;

  if (selector.charAt(0) == "#") {
    var attr = element.attribute.filter((attr) => attr.name === "id")[0];
    if (attr && attr.value === selector.replace("#", "")) return true;
  } else if (selector.charAt(0) === ".") {
    var attr = element.attribute.filter((attr) => attr.name === "class")[0];
    if (attr && attr.value === selector.replace(".", "")) return true;
  } else {
    if (element.tagName === selector) return true;
  }
}

function specificity(selector) {
  var p = [0, 0, 0, 0];
  var selectorParts = selector.split(" ");
  for (var part of selectorParts) {
    if (part.charAt(0) == "#") {
      p[1] += 1;
    } else if (part.charAt(0) == ".") {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) sp1[0] - sp2[0];
  if (sp1[1] - sp2[1]) sp1[1] - sp2[1];
  if (sp1[2] - sp2[2]) sp1[2] - sp2[2];

  return sp1[3] - sp2[3];
}

//根据element计算CSS规则
function computeCSS(element) {
  //slice 不传参数的时候就是把stack里面的内容复制一遍
  //由于CSS匹配的时候是从当前元素向外匹配，而我们slice获取的内容是从外向内(从document --> 当前元素)，所以需要reverse处理
  var elements = stack.slice().reverse();
  if (!element.computedStyle) {
    element.computedStyle = {};
  }

  for (let rule of rules) {
    var selectorParts = rule.selectors[0].split(" ").reverse();

    if (!match(element, selectorParts[0])) continue;

    let matched = false;

    //用j来表示当前选择器的位置，用i来表示当前元素的位置
    var j = 1;
    for (var i = 0; i < elements.length; i++) {
      //一旦元素能够匹配到选择器，就让j自增
      if (match(elements[i], selectorParts[j])) {
        j++;
      }
    }
    //当j大于等于选择器数组长度的时候，就说明完成匹配
    if (j >= selectorParts.length) {
      matched = true;
    }

    if (matched) {
      //如果匹配到，将css规则加入dom树
      var sp = specificity(rule.selectors[0]);
      var computedStyle = element.computedStyle;
      for (var declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};
        }

        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        } else if (
          compare(computedStyle[declaration.property].specificity, sp) < 0
        ) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
    }
  }
}

function emit(token) {
  //将栈顶（最后一个元素）取出来
  let top = stack[stack.length - 1];

  if (token.type == "startTag") {
    let element = {
      type: "element",
      children: [],
      attribute: [],
    };

    element.tagName = token.tagName;

    for (let p in token) {
      if (p != "type" && p != "tagName") {
        element.attribute.push({
          name: p,
          value: token[p],
        });
      }
    }

    //计算css规则
    computeCSS(element);

    top.children.push(element);

    //将父节点进行声明，但是在stack[0]转JSON的时候会出现循环引用的问题，此时需要将这一句注释
    //但在正常代码是需要解除注释
    //Error:Converting circular structure to JSON
    // element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }
    currentTextNode = null;
  } else if (token.type == "endTag") {
    if (top.tagName != token.tagName) {
      throw new Error("Tag start end doesn't match !");
    } else {
      //遇到Style标签的时候，执行添加Css规则的操作
      if (top.tagName === "style") {
        addCssRules(top.children[0].content);
      }
      //布局计算的时机发生在找到结束标签之前
      layout(top);
      //如果给开始标签匹配到结束标签就从栈里移除
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.type == "text") {
    // 处理文本节点
    if (currentTextNode == null) {
      currentTextNode = {
        type: "text",
        content: "",
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

//由于在文件终结位置，比如一些文本节点，可能面临着没有结束的状态，所以在最后必须给他一个额外字符（但不能是任何有效字符）
//在最后强迫一些节点完成截止标志
const EOF = Symbol("EOF");

function data(c) {
  if (c == "<") {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: "EOF",
    });
    return;
  } else {
    emit({
      type: "text",
      content: c,
    });
    return data;
  }
}

function tagOpen(c) {
  if (c == "/") {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: "",
    };
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: "",
    };
    return tagName(c);
  } else if (c == ">") {
  } else if (c == EOF) {
  } else {
  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c == ">") {
    emit(currentToken);
    return data;
  } else {
    currentToken.tagName += c;
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == ">" || c == "/" || c == EOF) {
    return afterAttributeName(c);
  } else if (c == "=") {
  } else {
    currentAttribute = {
      name: "",
      value: "",
    };
    return attributeName(c);
  }
}

function attributeName(c) {
  if (c.match(/^[\t\f\n ]$/) || c == "/" || c == ">" || c == EOF) {
    return afterAttributeName(c);
  } else if (c == "=") {
    return beforeAttributeValue;
  } else if (c == "/u0000") {
  } else if (c == '"' || c == "'" || c == "<") {
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\f\n ]$/) || c == "/" || c == ">" || c == EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    return doubleQuotedAttributeValue;
  } else if (c == "'") {
    return singleQuotedAttributeValue;
  } else if (c == ">") {
    return data;
  } else {
    return UnquotedAttributeValue(c);
  }
}

function doubleQuotedAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == "\u0000") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(c) {
  if (c == "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == "\u0000") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    //注意
    return doubleQuotedAttributeValue;
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
  } else {
    //注意
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

function UnquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c == "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == "\u0000") {
  } else if (c == '"' || c == "'" || c == "<" || c == "=" || c == "`") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

function selfClosingStartTag(c) {
  if (c == ">") {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
  } else {
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c == "=") {
    return beforeAttributeValue;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: "",
      value: "",
    };
    return attributeName(c);
  }
}

module.exports.parseHTML = function parseHTML(html) {
  //有限状态机的方式来解析HTML
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);

  return stack[0];
};
