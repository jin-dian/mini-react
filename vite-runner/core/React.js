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
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el]
    }
  }
}

const React = {
  render,
  createElement
}

let nextUnitOfWork = null
function workloop(deadline) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  // 是否让路
  let shouldYield = false

  while(!shouldYield && nextUnitOfWork) {
    shouldYield = deadline.timeRemaining() < 30
  }

  requestIdleCallback(workloop)
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
  ? document.createTextNode('')
  : document.createElement(type)
}

function updateProps(dom, props) {
  Object.keys(props).forEach((key) => {
    // 不处理children
    if (key !== "children") {
      dom[key] = props[key]
    }
  })
}

function initChildren(fiber) {
  const children = fiber.props.children
  // 记录上一个孩子节点
  let prevChild = null
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      dibling: null,
      dom: null
    }
    if(index === 0) {
      fiber.child = newFiber
    } else {
      // 记录兄弟节点
      prevChild.sibling = newFiber
    }
    prevChild = newFiber
  })
}

function performUnitOfWork(fiber) {
  // 1.创建dom
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))
    fiber.parent.dom.append(dom)

    // 2.处理props
    updateProps(fiber.dom, fiber.props)
  }
  // 3.转换链表 设置好指针
  initChildren(fiber)
  // 4.返回下一个
  // 深度优先遍历
  // 子节点，兄弟节点，叔叔节点
  if(fiber.child) {
    return fiber.child
  }
  if(fiber.sibling) {
    return fiber.sibling
  }
  return fiber.parent?.sibling
}

requestIdleCallback(workloop)

export default React