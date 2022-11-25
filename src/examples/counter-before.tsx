// http://localhost:3000/isolated/examples/counter-before.tsx

import * as React from 'react'
import { exhaustiveCheck } from '../utils'

type CounterState = {
  count: number
}

type CounterAction =
  | {
    type: 'increment'
    step?: number
  }
  | {
    type: 'decrement'
    step?: number
  }

type TCounterContext = readonly [CounterState, React.Dispatch<CounterAction>]

// src/context/counter.tsx
const CounterContext = React.createContext<TCounterContext | undefined>(undefined)

function CounterProvider({ step = 1, initialCount = 0, ...props }: {
  step?: number, initialCount?: number,
  children: React.ReactNode
}) {
  const [state, dispatch] = React.useReducer(
    (state: CounterState, action: CounterAction) => {
      const change = action.step ?? step
      switch (action.type) {
        case 'increment': {
          return { ...state, count: state.count + change }
        }
        case 'decrement': {
          return { ...state, count: state.count - change }
        }
        default: {
          exhaustiveCheck(action, 'action.type')
        }
      }
    },
    { count: initialCount },
  )

  return <CounterContext.Provider value={[state, dispatch] as const} {...props} />
}

function useCounter() {
  const context = React.useContext(CounterContext)
  if (context === undefined) {
    throw new Error(`useCounter must be used within a CounterProvider`)
  }
  return context
}

// export {CounterProvider, useCounter}

// src/screens/counter.tsx
// import {useCounter} from 'context/counter'

function Counter() {
  const [state, dispatch] = useCounter()
  const increment = () => dispatch({ type: 'increment' })
  const decrement = () => dispatch({ type: 'decrement' })
  return (
    <div>
      <div>Current Count: {state.count}</div>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  )
}

// src/index.tsx
// import {CounterProvider} from 'context/counter'

function App() {
  return (
    <CounterProvider>
      <Counter />
    </CounterProvider>
  )
}

export default App
