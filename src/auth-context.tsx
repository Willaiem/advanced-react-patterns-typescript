import * as React from 'react'
import { User } from './types'

// normally this is going to implement a similar pattern
// learn more here: https://kcd.im/auth

type TAuthContext = {
  user: User
}

const AuthContext = React.createContext<TAuthContext>({
  user: { username: 'jakiechan', tagline: '', bio: '' },
})
AuthContext.displayName = 'AuthContext'
const AuthProvider = ({ user, ...props }: { user: TAuthContext, children: React.ReactNode }) => (
  <AuthContext.Provider value={user} {...props} />
)

function useAuth() {
  return React.useContext(AuthContext)
}

export { AuthProvider, useAuth }
