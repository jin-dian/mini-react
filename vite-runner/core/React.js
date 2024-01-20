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
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextUnitOfWork = wipRoot
}

// work in progress
let wipRoot = null
let currentRoot = null
let nextUnitOfWork = null
let deletions = []
let wipFiber = null
function workloop(deadline) {
  // 是否让路
  let shouldYield = false

  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

    if(wipRoot?.sibling?.type === nextUnitOfWork?.type) {
      nextUnitOfWork = undefined
    }

    shouldYield = deadline.timeRemaining() < 1
  }

  if(!nextUnitOfWork && wipRoot) {
    commitRoot(wipRoot)
  }

  requestIdleCallback(workloop)
}

function commitRoot() {
  deletions.forEach(commitDeletion)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
  deletions = []
}

function commitDeletion(fiber) {
  if(fiber.dom) {
    let fiberParent = fiber.parent
    while(!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child)
  }
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
          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, nextProps[key])
        } else {
          dom[key] = nextProps[key]
        }
      }
    }
  })
}

function reconcileChildren(fiber, children) {
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
      if(child) {
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
        deletions.push(oldFiber)
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
    if(newFiber) {
      prevChild = newFiber
    }
  })

  while(oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

function updateFunctionComponent(fiber) {
  stateHooks = []
  stateHookIndex = 0
  wipFiber = fiber
  
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))

    // 2.处理props
    updateProps(dom, fiber.props, {})
  }

  // 3.转换链表 设置好指针
  const children = fiber.props.children
  reconcileChildren(fiber, children)
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

function update() {
  let currentFiber = wipFiber
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    // wipRoot = {
    //   dom: currentRoot.dom,
    //   props: currentRoot.props,
    //   alternate: currentRoot
    // }
    nextUnitOfWork = wipRoot
  }
}

let stateHooks;
let stateHookIndex;
function useState(initial) {
  let currentFiber = wipFiber
  const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex]
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : []
  }

  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state)
  })

  stateHook.queue = []

  stateHookIndex++
  stateHooks.push(stateHook)

  currentFiber.stateHooks = stateHooks

  function setState(action) {
    
    stateHook.queue.push(typeof action === "function" ? action : () => action)

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextUnitOfWork = wipRoot
  }
  return [stateHook.state, setState]
}

const React = {
  render,
  update,
  useState,
  createElement
}

export default React