export function extendContext (defaultContext, context) {
  if (!context || typeof context !== 'object') {
    return defaultContext
  }

  const { store, ...ctx } = context

  if (store) {
    // eslint-disable-next-line
    console.warn(
      `You cannot extend the context with an object containing a "store" prop. It will be omitted and the other props will be added`
    )
  }

  for (const propName of Object.keys(ctx)) {
    if (defaultContext.hasOwnProperty(propName)) {
      // eslint-disable-next-line
      console.warn(
        `The "${propName}" property already exists in the context object. Make sure you haven't replaced anything important`
      )
    }
  }

  return { ...defaultContext, ...ctx, }
}
