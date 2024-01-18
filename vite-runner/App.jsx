import React from "./core/React.js"

let showBar = false
function Counter({num}) {
  function Foo() {
    return <div>foo</div>
  }
  const bar = <p>bar</p>

  function handleShowBar() {
    showBar = !showBar
    React.update()
  }

  return <div>
    Counter
    <div>{showBar ? bar : <Foo></Foo>}</div>
    <button onClick={handleShowBar}>click</button>
  </div>
}

function App() {
  return <div>hi-mini-react
    <Counter num={10}></Counter>
    {/* <Counter num={20}></Counter> */}
    </div>
}

// const App = React.createElement("div", { id: "app" }, "hi-", "mini-react")

export default App