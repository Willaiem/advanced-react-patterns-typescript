// Control Props
// 💯 add read only warning
// http://localhost:3000/isolated/final/06.extra-1.tsx

import * as React from 'react'
import { Switch } from '../switch'
import { FlatTypes } from '../types'
import { exhaustiveCheck } from '../utils'
import warning from '../warning'

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

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn,
  readOnly = false,
}: {
  initialOn?: boolean
  reducer?: (state: ToggleState, action: ToggleAction) => ToggleState
  onChange?: (state: ToggleState, action: ToggleAction) => void
  on: boolean
  readOnly?: boolean
}) {
  const { current: initialState } = React.useRef({ on: initialOn })
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const onIsControlled = controlledOn != null
  const on = onIsControlled ? controlledOn : state.on

  const hasOnChange = Boolean(onChange)
  React.useEffect(() => {
    warning(
      !(!hasOnChange && onIsControlled && !readOnly),
      `An \`on\` prop was provided to useToggle without an \`onChange\` handler. This will render a read-only toggle. If you want it to be mutable, use \`initialOn\`. Otherwise, set either \`onChange\` or \`readOnly\`.`,
    )
  }, [hasOnChange, onIsControlled, readOnly])

  function dispatchWithOnChange(action: ToggleAction) {
    if (!onIsControlled) {
      dispatch(action)
    }
    onChange?.(reducer({ ...state, on }, action), action)
  }

  const toggle = () => dispatchWithOnChange({ type: actionTypes.toggle })
  const reset = () =>
    dispatchWithOnChange({ type: actionTypes.reset, initialState })

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

function Toggle({ on: controlledOn = false, onChange, readOnly }: {
  on?: boolean
  onChange?: (state: ToggleState, action: ToggleAction) => void
  readOnly?: boolean
}) {
  const { on, getTogglerProps } = useToggle({
    on: controlledOn,
    onChange,
    readOnly,
  })
  const props = getTogglerProps({ on })
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state: ToggleState, action: ToggleAction) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export { Toggle }

/*
eslint
  no-unused-expressions: "off",
*/
