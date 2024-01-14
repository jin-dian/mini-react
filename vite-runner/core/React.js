function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type: type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'string' ? createTextNode(child) : child
      })
    }
  }
}


function render(el, container) {
  const dom = el.type === "TEXT_ELEMENT"
    ? document.createTextNode('')
    : document.createElement(el.type)

  // 多个key处理
  Object.keys(el.props).forEach((key) => {
    // 不处理children
    if (key !== "children") {
      dom[key] = el.props[key]
    }
  })

  const children = el.props.children
  children.forEach(child => {
    render(child, dom)
  })

  container.append(dom)
}

const React = {
  render,
  createElement
}

export default React