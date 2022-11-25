// http://localhost:3000/isolated/examples/counter-after.tsx

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

function CounterProvider({ step = 1, initialCount = 0, ...props }) {
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

  return <CounterContext.Provider value={[state, dispatch]} {...props} />
}

function useCounter() {
  const context = React.useContext(CounterContext)
  if (context === undefined) {
    throw new Error(`useCounter must be used within a CounterProvider`)
  }
  return context
}

const increment = (dispatch: React.Dispatch<CounterAction>) => dispatch({ type: 'increment' })
const decrement = (dispatch: React.Dispatch<CounterAction>) => dispatch({ type: 'decrement' })

// export {CounterProvider, useCounter, increment, decrement}

// src/screens/counter.tsx
// import {useCounter, increment, decrement} from 'context/counter'

function Counter() {
  const [state, dispatch] = useCounter()
  return (
    <div>
      <div>Current Count: {state.count}</div>
      <button onClick={() => decrement(dispatch)}>-</button>
      <button onClick={() => increment(dispatch)}>+</button>
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
