// State Reducer
// http://localhost:3000/isolated/exercise/05.tsx

// 💣 Remove the ts-nocheck comment and start working!
// @ts-nocheck

import * as React from 'react'
import { Switch } from '../switch'
import { FlatTypes } from '../types'
import { exhaustiveCheck } from '../utils'

type ToggleState = {
  on: boolean
}

type ToggleAction =
  | {
    type: 'toggle'
  }
  | {
    type: 'reset'
    initialState: ToggleState
  }

type GetTogglerProps = FlatTypes<
  & Omit<JSX.IntrinsicElements['span'], 'ref'>
  & Pick<JSX.IntrinsicElements['input'], 'disabled'>
  & { on: boolean }
>

type GetResetterProps = FlatTypes<JSX.IntrinsicElements['button']>

const callAll = (...fns: Function[]) => (...args: unknown[]) => fns.forEach(fn => fn?.(...args))

function toggleReducer(state: ToggleState, action: ToggleAction) {
  switch (action.type) {
    case 'toggle': {
      return { on: !state.on }
    }
    case 'reset': {
      return action.initialState
    }
    default: {
      exhaustiveCheck(action, 'action.type')
    }
  }
}

// 🐨 add a new option called `reducer` that defaults to `toggleReducer`
function useToggle({ initialOn = false }: { initialOn?: boolean }) {
  const { current: initialState } = React.useRef({ on: initialOn })
  // 🐨 instead of passing `toggleReducer` here, pass the `reducer` that's
  // provided as an option
  // ... and that's it! Don't forget to check the 💯 extra credit!
  const [state, dispatch] = React.useReducer(toggleReducer, initialState)
  const { on } = state

  const toggle = () => dispatch({ type: 'toggle' })
  const reset = () => dispatch({ type: 'reset', initialState })

  function getTogglerProps({ onClick, ...props }: GetTogglerProps) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick ?? (() => { }), toggle),
      ...props,
    }
  }

  function getResetterProps({ onClick, ...props }: GetResetterProps) {
    return {
      onClick: callAll(onClick ?? (() => { }), reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function App() {
  const [timesClicked, setTimesClicked] = React.useState(0)
  const clickedTooMuch = timesClicked >= 4

  function toggleStateReducer(state: ToggleState, action: ToggleAction) {
    switch (action.type) {
      case 'toggle': {
        if (clickedTooMuch) {
          return { on: state.on }
        }
        return { on: !state.on }
      }
      case 'reset': {
        return { on: false }
      }
      default: {
        exhaustiveCheck(action, 'action.type')
      }
    }
  }

  const { on, getTogglerProps, getResetterProps } = useToggle({
    reducer: toggleStateReducer,
  })

  return (
    <div>
      <Switch
        {...getTogglerProps({
          disabled: clickedTooMuch,
          on: on,
          onClick: () => setTimesClicked(count => count + 1),
        })}
      />
      {clickedTooMuch ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : timesClicked > 0 ? (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      ) : null}
      <button {...getResetterProps({ onClick: () => setTimesClicked(0) })}>
        Reset
      </button>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
