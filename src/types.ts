// This is a useful helper type to make the type declarations cleaner and easier to read.
// Useful when merging multiple types into one.
export type FlatTypes<T> = {
  [K in keyof T]: T[K]
}

export type User = {
  username: string
  tagline: string
  bio: string
}

export type Updates = User
