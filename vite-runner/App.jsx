import React from "./core/React.js"

function Foo() {
  const [count, setCount] = React.useState(10)
  function handleClick() {
    setCount((c) => c + 1)
  }

  return <div>
    <h1>foo</h1>
    {count}
    <button onClick={handleClick}>click</button>
  </div>
}

function App() {
  return <div>
    {/* <button onClick={handleClick}>click</button> */}
    <Foo></Foo>
    </div>
}

// const App = React.createElement("div", { id: "app" }, "hi-", "mini-react")

export default App