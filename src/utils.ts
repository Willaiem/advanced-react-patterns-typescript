export function exhaustiveCheck(param: never, type: string): never {
  throw new TypeError(`${param} is not a proper ${type}`);
}

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export const transformError = (err: unknown) => {
  if (err instanceof Error) {
    return err
  }

  if (typeof err === 'string') {
    return new Error(err)
  }

  if (isPlainObject(err)) {
    return new Error(String(err.message))
  }

  return new Error(String(err))
}
