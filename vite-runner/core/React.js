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
  root = nextUnitOfWork
}

const React = {
  render,
  createElement
}

let root = null
let nextUnitOfWork = null
function workloop(deadline) {
  // 是否让路
  let shouldYield = false

  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if(!nextUnitOfWork && root) {
    commitRoot(root)
  }

  requestIdleCallback(workloop)
}

function commitRoot() {
  commitWork(root.child)
  root = null
}

function commitWork(fiber) {
  if(!fiber) return
  let fiberParent = fiber.parent
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }
  if(fiber.dom) {
    fiberParent.dom.append(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
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

function initChildren(fiber, children) {
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
  const isFunctionComponent = typeof fiber.type === "function"
  if(!isFunctionComponent) {
    if (!fiber.dom) {
      const dom = (fiber.dom = createDom(fiber.type))
  
      // 2.处理props
      updateProps(dom, fiber.props)
    }
  }
  // 3.转换链表 设置好指针
  const children = isFunctionComponent ? [fiber.type()] : fiber.props.children
  initChildren(fiber, children)
  // 4.返回下一个
  // 深度优先遍历
  // 子节点，兄弟节点，叔叔节点
  if(fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while(nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

requestIdleCallback(workloop)

export default React