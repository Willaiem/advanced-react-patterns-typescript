// Compound Components
// 💯 Support non-toggle children
// http://localhost:3000/isolated/final/02.extra-1.tsx

import * as React from 'react'
import { Switch } from '../switch'

const isReactElement = <P extends {}>(elem: unknown): elem is React.ReactElement<P> => {
  return React.isValidElement(elem)
}

type TogglePassedProps = {
  on?: boolean
  toggle?: () => void
}

function Toggle({ children }: { children: React.ReactNode }) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)
  return <>{React.Children.map(children, child => {
    if (isReactElement<TogglePassedProps>(child)) {
      return typeof child.type === 'string'
        ? child
        : React.cloneElement(child, { on, toggle })
    }

    throw new Error('Non-React element was passed.', {
      cause: child
    })
  })}</>
}

type ToggleOnProps = {
  on?: boolean
  children: React.ReactNode
}

type ToggleOffProps = {
  on?: boolean
  children: React.ReactNode
}


function ToggleOn({ on, children }: ToggleOnProps) {
  return on ? <>{children}</> : null
}

function ToggleOff({ on, children }: ToggleOffProps) {
  return on ? null : <>{children}</>
}

type ToggleButtonProps = TogglePassedProps & {
  children?: React.ReactNode
}

function ToggleButton({ on, toggle, ...props }: ToggleButtonProps) {
  if (!(on && toggle)) {
    return null
  }

  return <Switch on={on} onClick={toggle} {...props} />
}

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <span>Hello</span>
        <ToggleButton />
      </Toggle>
    </div>
  )
}

export default App
