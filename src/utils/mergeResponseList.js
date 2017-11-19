import { mergeErrorList, } from './mergeErrorList'
import { mergeDataList, } from './mergeDataList'

export function mergeResponseList (list) {
  let errorList = []
  let dataList = []

  for (const { data, errors, } of list) {
    errors && (errorList = [ ...errorList, ...errors, ])
    data && (dataList = [ ...dataList, data, ])
  }

  const mergedData = mergeDataList(dataList)
  const mergedErrors = mergeErrorList(errorList)

  const response = {
    ...(mergedData ? { data: mergedData, } : {}),
    ...(mergedErrors ? { errors: mergedErrors, } : {}),
  }

  return response
}
