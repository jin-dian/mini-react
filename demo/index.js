let taskId = 1
function workloop(deadline) {
  taskId ++
  // 是否让路
  let shouldYield = false

  while(!shouldYield) {
    // run task
    console.log(`taskId: ${taskId} run task`)
    // dom
    shouldYield = deadline.timeRemaining() < 30
  }

  requestIdleCallback(workloop)
}

requestIdleCallback(workloop)