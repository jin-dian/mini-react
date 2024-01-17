import React from "./core/React.js"

let count = 10
let props = {id: '111'}
function Counter({num}) {
  // update
  function handleClick() {
    console.log('click')
    count++
    props = {id: count}
    React.update()
  }
  return <div {...props}>
    count: {count}
    <button onClick={handleClick}>click</button>
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