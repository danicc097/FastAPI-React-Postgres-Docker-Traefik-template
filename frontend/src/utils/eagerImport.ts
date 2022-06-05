import { ComponentType, lazy, LazyExoticComponent } from 'react'

export const eagerImportDefault = (factory) => {
  const importPromise = factory()
  return lazy(() => importPromise)
}

export const eagerImport = (factory: () => Promise<any>) => {
  const promise = factory()
  return new Proxy(
    {},
    {
      get: (_target, componentName: any) => {
        return lazy(() =>
          promise.then((x) => ({
            default: x[componentName],
          })),
        )
      },
    },
  )
}
