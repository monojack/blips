export const STORE_EXTEND_WARNING = `You cannot extend the context with an object containing a "store" prop. It will be omitted and the other props will be added`
export const buildPropExistsWarning = propName =>
  `The "${
    propName
  }" property already exists in the context object. Make sure you haven't replaced anything important`

export function extendContext (defaultContext, context) {
  if (
    !context || // nil or falsy
    typeof context !== 'object' || // not an object
    context.hasOwnProperty('length') || // array
    context.hasOwnProperty('size') // map
  ) {
    return defaultContext
  }

  const { store, ...ctx } = context

  if (store) {
    // eslint-disable-next-line
    console.warn(STORE_EXTEND_WARNING)
  }

  for (const propName of Object.keys(ctx)) {
    if (defaultContext.hasOwnProperty(propName)) {
      // eslint-disable-next-line
      console.warn(buildPropExistsWarning(propName))
    }
  }

  return { ...defaultContext, ...ctx, }
}
