import React from "./core/React.js"

function Counter({num}) {
  function handleClick() {
    console.log('click')
  }
  return <div>count: {num}
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