export function mergeDataList (list) {
  return list.reduce((acc, curr) => {
    return {
      ...acc,
      data: { ...(acc['data'] || {}), ...(curr['data'] || {}), },
      errors: [ ...(acc['errors'] || []), ...(curr['errors'] || []), ],
    }
  }, {})
}
