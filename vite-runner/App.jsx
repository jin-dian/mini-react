import React from "./core/React.js"

function Foo() {
  console.log("re foo")
  const [count, setCount] = React.useState(10)
  const [bar, setBar] = React.useState("bar")
  function handleClick() {
    setCount((c) => c + 1)
    // setBar("barbar")
    setBar("bar")
  }

  React.useEffect(() => {
    console.log("init")
    return () => {
      console.log("cleanup 0")
    }
  }, [])

  React.useEffect(() => {
    console.log("update", count)
    return () => {
      console.log("cleanup 1")
    }
  }, [count])

  React.useEffect(() => {
    console.log("update", count)
    return () => {
      console.log("cleanup 2")
    }
  }, [count])

  return <div>
    <h1>foo</h1>
    {count}
    {bar}
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