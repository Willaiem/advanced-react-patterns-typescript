export function assertsIsNotNull<T>(value: T | null): asserts value is T {
  expect(value).not.toBeNull()
}
