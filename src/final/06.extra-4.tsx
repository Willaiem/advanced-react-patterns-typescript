// Control Props
// 💯 don't warn in production
// http://localhost:3000/isolated/final/06.extra-4.tsx

import * as React from 'react'
import { Switch } from '../switch'
import { FlatTypes } from '../types'
import { exhaustiveCheck } from '../utils'
import warning from '../warning'

type ToggleState = {
  on?: boolean
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
  & { on?: boolean }
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

function useControlledSwitchWarning(
  controlPropValue: unknown,
  controlPropName: string,
  componentName: string,
) {
  const isControlled = controlPropValue != null
  const { current: wasControlled } = React.useRef(isControlled)

  React.useEffect(() => {
    warning(
      !(isControlled && !wasControlled),
      `\`${componentName}\` is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
    )
    warning(
      !(!isControlled && wasControlled),
      `\`${componentName}\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
    )
  }, [componentName, controlPropName, isControlled, wasControlled])
}

function useOnChangeReadOnlyWarning(
  controlPropValue: unknown,
  controlPropName: string,
  componentName: string,
  hasOnChange: boolean,
  readOnly: boolean,
  readOnlyProp: string,
  initialValueProp: string,
  onChangeProp: string,
) {
  const isControlled = controlPropValue != null
  React.useEffect(() => {
    warning(
      !(!hasOnChange && isControlled && !readOnly),
      `A \`${controlPropName}\` prop was provided to \`${componentName}\` without an \`${onChangeProp}\` handler. This will result in a read-only \`${controlPropName}\` value. If you want it to be mutable, use \`${initialValueProp}\`. Otherwise, set either \`${onChangeProp}\` or \`${readOnlyProp}\`.`,
    )
  }, [
    componentName,
    controlPropName,
    isControlled,
    hasOnChange,
    readOnly,
    onChangeProp,
    initialValueProp,
    readOnlyProp,
  ])
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
  on?: boolean
  readOnly?: boolean
}) {
  const { current: initialState } = React.useRef({ on: initialOn })
  const [state, dispatch] = React.useReducer(reducer, initialState)

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useControlledSwitchWarning(controlledOn, 'on', 'useToggle')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useOnChangeReadOnlyWarning(
      controlledOn,
      'on',
      'useToggle',
      Boolean(onChange),
      readOnly,
      'readOnly',
      'initialOn',
      'onChange',
    )

  }

  const onIsControlled = controlledOn !== null
  const on = onIsControlled ? controlledOn : state.on

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

function Toggle({ on: controlledOn, onChange, readOnly }: {
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
    setBothOn(state.on ?? false)
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
