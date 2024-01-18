import React from "./core/React.js"

let countFoo = 1
function Foo() {
  console.log("foo rerun")
  let update = React.update()
  function handleClick() {
    countFoo++
    update()
  }

  return <div>
    <h1>foo</h1>
    {countFoo}
    <button onClick={handleClick}>click</button>
  </div>
}

let countBar = 1
function Bar() {
  let update = React.update()
  console.log("foo rerun")
  function handleClick() {
    countBar++
    update()
  }

  return <div>
    <h1>bar</h1>
    {countBar}
    <button onClick={handleClick}>click</button>
  </div>
}

let countRoot = 1
function App() {
  let update = React.update()
  console.log("app rerun")
  function handleClick() {
    countRoot++
    update()
  }
  return <div>
    hi-mini-react count: {countRoot}
    <button onClick={handleClick}>click</button>
    <Foo></Foo>
    <Bar></Bar>
    </div>
}

// const App = React.createElement("div", { id: "app" }, "hi-", "mini-react")

export default App