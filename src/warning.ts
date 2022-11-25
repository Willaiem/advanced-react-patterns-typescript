// Example implementation of the warning package.
function warning(condition: boolean, message: string) {
  if (!condition) {
    console.error(message)
  }
}

export default warning
