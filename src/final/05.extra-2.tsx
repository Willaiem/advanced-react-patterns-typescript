// state reducer
// 💯 state reducer action types
// http://localhost:3000/isolated/final/05.extra-2.tsx

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

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
} as const

function toggleReducer(state: ToggleState, action: ToggleAction) {
  switch (action.type) {
    case actionTypes.toggle: {
      return { on: !state.on }
    }
    case actionTypes.reset: {
      return action.initialState
    }
    default: {
      exhaustiveCheck(action, 'action.type')
    }
  }
}

function useToggle({ initialOn = false, reducer = toggleReducer }: {
  initialOn?: boolean,
  reducer?: (state: ToggleState, action: ToggleAction) => ToggleState
}) {
  const { current: initialState } = React.useRef({ on: initialOn })
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { on } = state

  const toggle = () => dispatch({ type: actionTypes.toggle })
  const reset = () => dispatch({ type: actionTypes.reset, initialState })

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
// export {useToggle, toggleReducer, actionTypes}

// import {useToggle, toggleReducer, actionTypes} from './use-toggle'

function App() {
  const [timesClicked, setTimesClicked] = React.useState(0)
  const clickedTooMuch = timesClicked >= 4

  function toggleStateReducer(state: ToggleState, action: ToggleAction) {
    if (action.type === actionTypes.toggle && clickedTooMuch) {
      return { on: state.on }
    }
    return toggleReducer(state, action)
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
