export function mergeHeaders (...args) {
  let list = []

  for (const arg of args) {
    if (typeof arg === 'object') {
      for (const item of arg.entries ? arg.entries() : Object.entries(arg)) {
        list.push(item)
      }
    }
  }

  return list.reduce(
    (acc, [ key, value, ]) => ({
      ...acc,
      [key]: value,
    }),
    {}
  )
}
