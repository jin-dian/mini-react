import React from "./core/React.js"

function Counter({num}) {
  return <div>count: {num}</div>
}

function App() {
  return <div>hi-mini-react
    <Counter num={10}></Counter>
    <Counter num={20}></Counter>
    </div>
}

// const App = React.createElement("div", { id: "app" }, "hi-", "mini-react")

export default App