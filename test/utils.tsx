import { alfredTip } from '@kentcdodds/react-workshop-app/test-utils'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import {
  findAllInRenderedTree,
  isCompositeComponentWithType
} from 'react-dom/test-utils'
import { Switch } from '../src/switch'

function assertsIsReactComponent(comp: unknown): asserts comp is React.Component {
  expect(comp).toBeInstanceOf(React.Component)
}

const findSwitchInstances = (rootInstance: React.Component) =>
  findAllInRenderedTree(rootInstance, c =>
    isCompositeComponentWithType(c, Switch),
  )

function validateSwitchInstance(switchInstance: React.ReactInstance) {
  alfredTip(
    () => expect(switchInstance).toBeDefined(),
    `Unable to find the Switch component. Make sure you're rendering that!`,
  )

  assertsIsReactComponent(switchInstance)

  alfredTip(
    () =>
      expect(switchInstance.props).toMatchObject({
        on: expect.any(Boolean),
        onClick: expect.any(Function),
        // it can also have aria-pressed...
      }),
    'The Switch component is not being passed the right props.',
  )
}

// this only exists so we can search for an instance of the Switch
// and make some assertions to give more helpful error messages.
class Root extends React.Component<{ children: React.ReactNode }> {
  render() {
    return this.props.children
  }
}

function renderToggle(ui: React.ReactNode) {
  let rootInstance!: Root
  let rootRef = (instance: Root | null) => {
    rootInstance = instance!
  }
  const utils = render(<Root ref={rootRef}>{ui}</Root>)
  const [switchInstance] = findSwitchInstances(rootInstance)
  validateSwitchInstance(switchInstance)
  const [toggleButton] = utils.getAllByTestId('toggle-input')

  return {
    toggle: () => userEvent.click(utils.getAllByTestId('toggle-input')[0]),
    toggleButton,
    rootInstance,
    ...utils,
  }
}

export * from '@testing-library/react'
export { render, renderToggle, userEvent }
