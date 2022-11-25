// Context Module Functions
// http://localhost:3000/isolated/exercise/01.tsx

import { dequal } from 'dequal'
import * as React from 'react'

// ./context/user-context.tsx

import { useAuth } from '../auth-context'
import { User } from '../types'
import * as userClient from '../user-client'
import { exhaustiveCheck } from '../utils'

type TUserState = {
  user: User | null
  storedUser: User | null
  status: 'pending' | 'resolved' | 'rejected' | null
  error?: Error | null
}

type TUserAction =
  | {
    type: 'start update'
    updates: User
  }
  | {
    type: 'finish update'
    updatedUser: User
  }
  | {
    type: 'fail update'
    error: Error
  }
  | {
    type: 'reset'
  }

type TUserContext = readonly [TUserState, React.Dispatch<TUserAction>]

const UserContext = React.createContext<TUserContext | undefined>(undefined)
UserContext.displayName = 'UserContext'

function userReducer(state: TUserState, action: TUserAction): TUserState {
  switch (action.type) {
    case 'start update': {
      return {
        ...state,
        user: { ...state.user, ...action.updates },
        status: 'pending',
        storedUser: state.user,
      }
    }
    case 'finish update': {
      return {
        ...state,
        user: action.updatedUser,
        status: 'resolved',
        storedUser: null,
        error: null,
      }
    }
    case 'fail update': {
      return {
        ...state,
        status: 'rejected',
        error: action.error,
        user: state.storedUser,
        storedUser: null,
      }
    }
    case 'reset': {
      return {
        ...state,
        status: null,
        error: null,
      }
    }
    default: {
      exhaustiveCheck(action, 'action.type')
    }
  }
}

function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = React.useReducer(userReducer, {
    status: null,
    error: null,
    storedUser: user,
    user,
  })
  const value = [state, dispatch] as const
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

function useUser() {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider`)
  }
  return context
}

// 🐨 add a function here called `updateUser`
// Then go down to the `handleSubmit` from `UserSettings` and put that logic in
// this function. It should accept: dispatch, user, and updates

// export {UserProvider, useUser}

// src/screens/user-profile.tsx
// import {UserProvider, useUser} from './context/user-context'

const USER_INITIAL_STATE: User = {
  username: '',
  tagline: '',
  bio: ''
}

function UserSettings() {
  const [{ user, status, error }, userDispatch] = useUser()

  const isPending = status === 'pending'
  const isRejected = status === 'rejected'

  const [formState, setFormState] = React.useState(USER_INITIAL_STATE)

  const isChanged = !dequal(user, formState)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!user) {
      return
    }

    // 🐨 move the following logic to the `updateUser` function you create above
    userDispatch({ type: 'start update', updates: formState })
    userClient.updateUser(user, formState).then(
      updatedUser => userDispatch({ type: 'finish update', updatedUser }),
      error => userDispatch({ type: 'fail update', error }),
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block' }} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          disabled
          readOnly
          value={formState.username}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block' }} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          value={formState.tagline}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block' }} htmlFor="bio">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setFormState(USER_INITIAL_STATE)
            userDispatch({ type: 'reset' })
          }}
          disabled={!isChanged || isPending}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={(!isChanged && !isRejected) || isPending}
        >
          {isPending
            ? '...'
            : isRejected
              ? '✖ Try again'
              : isChanged
                ? 'Submit'
                : '✔'}
        </button>
        {isRejected && error ? <pre style={{ color: 'red' }}>{error.message}</pre> : null}
      </div>
    </form>
  )
}

function UserDataDisplay() {
  const [{ user }] = useUser()
  return <pre>{JSON.stringify(user, null, 2)}</pre>
}

function App() {
  return (
    <div
      style={{
        minHeight: 350,
        width: 300,
        backgroundColor: '#ddd',
        borderRadius: 4,
        padding: 10,
      }}
    >
      <UserProvider>
        <UserSettings />
        <UserDataDisplay />
      </UserProvider>
    </div>
  )
}

export default App
