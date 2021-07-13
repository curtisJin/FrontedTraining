'use strict';

function getStyle (element) {
  if(!element.style) {
    element.style = {};
  }
  
  for(let prop in element.computedStyle) {
    var p = element.computedStyle.value;
    element.style[prop] = element.computedStyle[prop].value;

    if(element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }

    if(element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
  }

  return element.style;
}



function layout (element) {
  //如果元素中没有计算样式的属性，就跳过
  if(!element.computedStyle) return;

  //对样式进行预处理
  var elementStyle = getStyle(element);

  //非flex布局的return
  if(elementStyle.display !== 'flex') return;

  var items = element.children.filter(e => e.type === 'element');
  
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });

  var style = elementStyle;

  ['width', 'height'].forEach(size => {
    if(style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    }
  });

  //没有指定方向时设置默认的主轴和交叉轴
  if(!style.flexDirection || style.flexDirection === 'auto') 
    style.flexDirection = 'row';
  if(!style.alignItems || style.alignItems === 'auto')
    style.alignItems = 'stretch';
  if(!style.justifyContent || style.justifyContent === 'auto')
    style.justifyContent = 'flex-start';
  if(!style.flexWrap || style.flexWrap === 'auto')
    style.flexWrap = 'nowrap';
  if(!style.alignContent || style.alignContent === 'auto')
    style.alignContent = 'stretch';

  //将具体属性进行抽象
  var mainSize, mainStart, mainEnd, mainSign, mainBase, 
      crossSize, crossStart, crossEnd, crossSign, crossBase;

  if(style.flexDirection === 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'buttom';
  }

  if(style.flexDirection === 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = style.width;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'buttom';
  }

  if(style.flexDirection === 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if(style.flexDirection === 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  //wrap-reverse时只与交叉轴有关
  if(style.flexWrap === 'wrap-reverse') {
    var t = crossStart;
    crossStart = crossEnd;
    crossEnd = t;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  var isAutoMainSize = false;
  if(!style[mainSize]) {//如果样式没有设置宽度
    elementStyle[mainSize] = 0;
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }

  var flexLine = [];
  var flexLines = [flexLine];

  var mainSpace = elementStyle[mainSize];
  var crossSpace = 0;

  for(var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemStyle = getStyle(item);

    if(itemStyle[mainSize] === null) {
      itemStyle[mainSize] = 0;
    }

    if(itemStyle.flex) {
      //如果属性中有flex属性，就入行，该元素的宽度由主轴的剩余空间决定
      flexLine.push(item);
    } else if(style.flexWrap === 'nowrap' && isAutoMainSize) {//如果是弹性盒不换行或者是没有设置宽度的情况，放置在统一行
      mainSpace -= itemStyle[mainSize];
      //计算交叉轴方向单行的最高高度
      if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      if(itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }

      if(mainSpace < itemStyle[mainSize]) { //如果小于剩余宽度，就另起新行
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;//把剩余的宽和本行高度存起来

        flexLine = [];//另起一行
        flexLines.push(flexLine);

        flexLine.push(item); //把放不进的元素放进新的一行

        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }

      if(itemStyle[crossSpace] !== null && itemStyle[crossSize] !== (void 0)) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }
  //for 循环结束以后对最后剩余空间的处理小技巧
  flexLine.mainSpace = mainSpace;

  if(mainSpace < 0) {
    //single-line condition
    var scale = style[mainSize] / (style[mainSize] - mainSpace);
    var currentMain = mainBase;
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle(item);

      if(itemStyle.flex) {
        itemStyle[mainSize] = 0;
      } 

      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
  } else {
    //multi-lines condition: process each flex line
    flexLines.forEach(function (items) {
      var mainSpace = items.mainSpace;
      var flexTotal = 0;
      for(var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemStyle = getStyle(item);

        if((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if(flexTotal > 0) {
        var currentMain = mainSpace;
        for(var i = 0; i < items.length; i++) {
          var item = items[i];
          var itemStyle = getStyle(item);

          if(itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        // There is "NO" flexible flex items, which means, justifyContent should work
        if(style.justifyContent === 'flex-start') {
          var currentMain = mainBase;
          var step = 0;
        }
        if(style.justifyContent === 'flex-end') {
          var currentMain = mainSpace * mainSign + mainBase;
          var step = 0;
        }
        if(style.justifyContent === 'center') {
          var currentMain = mainSpace / 2 * mainSign + mainBase;
          var step = 0;
        }
        if(style.justifyContent === 'space-between') {
          var step = mainSpace / (items.length - 1) * mainSign;
          var currentMain = mainBase;
        } 
        if(style.justifyContent === 'space-around') {
          var step = mainSpace / items.length * mainSign;
          var currentMain = step / 2 + mainBase;
        }

        for(var i = 0; i < items.length; i++) {
          var item = items[i];
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    })
  }

  var crossSpace;

  if(!style[crossSize]) {
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for(var i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for(var i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }

  if(style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }
  var lineSize = style[crossSize] / flexLines.length;

  var step;
  if(style.alignContent === 'flex-start') {
    crossBase += 0;
    step = 0;
  }
  if(style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  if(style.alignContent === 'center') {
    crossBase += crossSign * crossSpace / 2;
    step = 0;
  }
  if(style.alignContent === 'space-between') {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if(style.alignContent === 'space-around') {
    step = crossSpace / (flexLines.length);
    crossBase += crossSign * step / 2;
  }
  if(style.alignContent === 'stretch') {
    crossBase += 0;
    step = 0;
  }

  flexLines.forEach(function(items) {
    var lineCrossSize = style.alignContent === 'stretch' ?
    items.crossSpace = crossSpace / flexLines.length :
    items.crossSpace;

    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemStyle = getStyle[item];

      var align = style.alignItems;

      if(itemStyle[crossSize] === null) {
        itemStyle[crossSize] = (align === 'stretch' ? lineCrossSize : 0);
      }
      if(align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if(align === 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }
      if(align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if(align === 'stretch') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ?
        itemStyle[crossSize] : lineCrossSize)
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  })
  console.log(items);
}

module.exports = layout;