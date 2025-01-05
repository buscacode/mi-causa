// TODO: test for this fn
/**
 * Return a boolean which means that at least one of the value
 * given by the params is not null and is not undefined
 */
export const doesExist = (...values: unknown[]): boolean => {
  let exist = false
  for (const value of values) {
    if (value !== null && value !== undefined) {
      exist = true
      break
    }
  }
  return exist
}
