import {
  act, render,
  screen,
  waitForElementToBeRemoved
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../auth-context'
import App from '../final/01'
import { assertsIsNotNull } from '../test-utils'
import { User } from '../types'
import * as userClient from '../user-client'
// import App from '../exercise/01'

jest.mock('../user-client', () => {
  return { updateUser: jest.fn(() => Promise.resolve()) }
})

const mockedUpdateUser = jest.mocked(userClient).updateUser

const mockUser = { username: 'jakiechan', tagline: '', bio: '' }

function renderApp() {
  const utils = render(
    <AuthProvider user={{ user: mockUser }}>
      <App />
    </AuthProvider>,
  )

  const userDisplayPre = utils.container.querySelector('pre')
  assertsIsNotNull(userDisplayPre)

  return {
    ...utils,
    submitButton: screen.getByText<HTMLButtonElement>(/✔/),
    resetButton: screen.getByText<HTMLButtonElement>(/reset/i),
    taglineInput: screen.getByLabelText<HTMLInputElement>(/tagline/i),
    bioInput: screen.getByLabelText<HTMLInputElement>(/bio/i),
    waitForLoading: () =>
      waitForElementToBeRemoved(() => screen.getByText(/\.\.\./i)),
    userDisplayPre,
    getDisplayData: () => JSON.parse(userDisplayPre.textContent ?? ''),
  }
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test('happy path works', async () => {
  const {
    submitButton,
    resetButton,
    taglineInput,
    bioInput,
    waitForLoading,
    getDisplayData,
  } = renderApp()

  // unchanged form disables reset and submit buttons
  expect(submitButton).toHaveAttribute('disabled')
  expect(resetButton).toHaveAttribute('disabled')

  const testData = { ...mockUser, tagline: 'test tagline', bio: 'test bio' }
  await userEvent.type(taglineInput, testData.tagline)
  await userEvent.type(bioInput, testData.bio)

  // changed form enables submit and reset
  expect(submitButton).toHaveTextContent(/submit/i)
  expect(submitButton).not.toHaveAttribute('disabled')
  expect(resetButton).not.toHaveAttribute('disabled')

  const updatedUser = { ...mockUser, ...testData }
  const defer = deferred<User>()
  mockedUpdateUser.mockImplementationOnce(() => defer.promise)

  await userEvent.click(submitButton)

  // pending form sets the submit button to ... and disables the submit and reset buttons
  expect(submitButton).toHaveTextContent(/\.\.\./i)
  expect(submitButton).toHaveAttribute('disabled')
  expect(resetButton).toHaveAttribute('disabled')
  // submitting the form invokes userClient.updateUser
  expect(userClient.updateUser).toHaveBeenCalledTimes(1)
  expect(userClient.updateUser).toHaveBeenCalledWith(mockUser, testData)
  mockedUpdateUser.mockClear()

  // once the submit button changes from ... then we know the request is over
  defer.resolve(updatedUser)
  await waitForLoading()

  // make sure all the text that should appear is there and the button state is correct
  expect(submitButton).toHaveAttribute('disabled')
  expect(submitButton).toHaveTextContent(/✔/)
  expect(resetButton).toHaveAttribute('disabled')

  // make sure the inputs have the right value
  expect(taglineInput.value).toBe(updatedUser.tagline)
  expect(bioInput.value).toBe(updatedUser.bio)

  // make sure the display data is correct
  expect(getDisplayData()).toEqual(updatedUser)
})

test('reset works', async () => {
  const { resetButton, taglineInput } = renderApp()

  await userEvent.type(taglineInput, 'foo')
  await userEvent.click(resetButton)
  expect(taglineInput.value).toBe(mockUser.tagline)
})

test('failure works', async () => {
  const {
    submitButton,
    resetButton,
    taglineInput,
    bioInput,
    waitForLoading,
    getDisplayData,
  } = renderApp()

  const testData = { ...mockUser, bio: 'test bio' }
  await userEvent.type(bioInput, testData.bio)
  const defer1 = deferred<User>()
  const testErrorMessage = 'test error message'
  mockedUpdateUser.mockImplementationOnce(() => defer1.promise)

  const updatedUser = { ...mockUser, ...testData }

  await userEvent.click(submitButton)

  await act(async () => {
    defer1.reject({ message: testErrorMessage })
    await defer1.promise.catch(() => { })
  })
  // await waitForLoading()

  expect(submitButton).toHaveTextContent(/try again/i)
  screen.getByText(testErrorMessage)
  expect(getDisplayData()).toEqual(mockUser)

  mockedUpdateUser.mockClear()

  const defer2 = deferred<User>()
  mockedUpdateUser.mockImplementationOnce(() => defer2.promise)
  await userEvent.click(submitButton)

  defer2.resolve(updatedUser)
  await screen.findByRole('button', { name: /✔/ })

  expect(resetButton).toHaveAttribute('disabled')

  // make sure the inputs have the right value
  expect(taglineInput.value).toBe(updatedUser.tagline)
  expect(bioInput.value).toBe(updatedUser.bio)

  // make sure the display data is correct
  expect(getDisplayData()).toEqual(updatedUser)
})
