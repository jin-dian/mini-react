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
        const isTextElement = typeof child === 'string' || typeof child === 'number'
        return isTextElement ? createTextNode(child) : child
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

let root = null
let currentRoot = null
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
  currentRoot = root
  root = null
}

function commitWork(fiber) {
  if(!fiber) return
  let fiberParent = fiber.parent
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }
  if(fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  } else if (fiber.effectTag === "placement") {
    if(fiber.dom) {
      fiberParent.dom.append(fiber.dom)
    }
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
  ? document.createTextNode('')
  : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {
  // Object.keys(props).forEach((key) => {
  //   // 不处理children
  //   if (key !== "children") {
  //     if(key.startsWith("on")) {
  //       const eventType = key.slice(2).toLowerCase()
  //       document.addEventListener(eventType, props[key])
  //     } else {
  //       dom[key] = props[key]
  //     }
  //   }
  // })
  // 1.old 有  new 没有 删除
  Object.keys(prevProps).forEach(key => {
    if(key !== "children") {
      if(!(key in nextProps)) {
        dom.removeAttribute(key)
      }
    }
  })
  // 2.new 有  old 没有 添加
  // 3.new 有  old 有   修改
  Object.keys(nextProps).forEach((key) => {
    // 不处理children
    if (key !== "children") {
      if(nextProps[key] !== prevProps[key]) {
        if(key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase()
          document.removeEventListener(eventType, prevProps[key])
          document.addEventListener(eventType, nextProps[key])
        } else {
          dom[key] = nextProps[key]
        }
      }
    }
  })
}

function initChildren(fiber, children) {
  // 记录上一个孩子节点
  let oldFiber = fiber.alternate?.child
  let prevChild = null
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type

    let newFiber = null
    if(isSameType) {
      // update
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: "update",
        alternate: oldFiber
      }
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: null,
        effectTag: "placement"
      }
    }

    if(oldFiber) {
      oldFiber = oldFiber.sibling
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

function updateFunctionComponent(fiber) {
  
  const children = [fiber.type(fiber.props)]
  initChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))

    // 2.处理props
    updateProps(dom, fiber.props, {})
  }

  // 3.转换链表 设置好指针
  const children = fiber.props.children
  initChildren(fiber, children)
}

function performUnitOfWork(fiber) {
  // 1.创建dom
  const isFunctionComponent = typeof fiber.type === "function"
  if(isFunctionComponent) updateFunctionComponent(fiber)
  else updateHostComponent(fiber)
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

function update(el, container) {
  nextUnitOfWork = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }
  root = nextUnitOfWork
}

const React = {
  render,
  update,
  createElement
}

export default React