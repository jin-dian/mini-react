import React from "./core/React.js"

function Counter() {
  return <div>count</div>
}

function App() {
  return <div>hi-mini-react<Counter></Counter></div>
}

// const App = React.createElement("div", { id: "app" }, "hi-", "mini-react")

export default App