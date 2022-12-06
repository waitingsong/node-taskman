/* eslint-disable @typescript-eslint/ban-types */
import assert from 'node:assert'

import { INJECT_CUSTOM_METHOD, getClassMetadata } from '@midwayjs/core'


export type CustomClassDecorator = <DecoratorArgs, TFunction extends Function>(
  target: TFunction,
  args: Partial<DecoratorArgs> | undefined,
) => void

export type CustomMethodDecorator = <DecoratorArgs, Target = unknown>(
  target: {},
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<Target>,
  args: Partial<DecoratorArgs> | undefined,
) => TypedPropertyDescriptor<Target> | void

export function customDecoratorFactory<DecoratorArgs, Target = unknown>(
  options: Partial<DecoratorArgs> | undefined,
  /**
   * The decorator function to be called.
   * Throws an error if undefined.
   */
  classDecorator: CustomClassDecorator | undefined,
  /**
   * The decorator function to be called.
   * Throws an error if undefined.
   */
  methodDecorator: CustomMethodDecorator | undefined,
): MethodDecorator & ClassDecorator {

  const DecoratorFactory = (
    target: Target,
    propertyKey?: string,
    descriptor?: TypedPropertyDescriptor<Target>,
  ): TypedPropertyDescriptor<Target> | Target | void => {

    assert(target, 'target is undefined')

    if (typeof target === 'function') { // Class Decorator
      assert(classDecorator, 'classDecorator is not allowed according to the options.classDecorator undefined')
      return classDecorator(target, options)
    }

    if (typeof target === 'object') { // Method Decorator
      assert(methodDecorator, 'methodDecorator is not allowed according to the options.methodDecorator undefined')
      assert(target, 'target is undefined')
      assert(propertyKey, 'propertyKey is undefined')
      assert(descriptor, 'descriptor is undefined')

      if (typeof descriptor.value !== 'function') {
        throw new Error('Only method can be decorated with @Cacheable decorator')
      }

      if (descriptor.value.constructor.name !== 'AsyncFunction') {
        throw new Error('Only async method can be decorated with @Cacheable decorator')
      }

      return methodDecorator<DecoratorArgs, Target>(target, propertyKey, descriptor, options)
    }

    assert(false, 'Invalid decorator usage')
  }

  // @ts-ignore
  return DecoratorFactory
}

export function methodHasDecorated(
  decoratorKey: string, // METHOD_KEY_CacheEvict | METHOD_KEY_Cacheable
  methodName: string,
  metaDataArr: DecoratorMetaData[] | undefined,
): boolean {

  assert(decoratorKey)

  if (! methodName) { return false }
  if (! metaDataArr?.length) { return false }

  for (const row of metaDataArr) {
    if (row.key === decoratorKey && row.propertyName === methodName) {
      return true
    }
  }

  return false
}

export interface DecoratorMetaData<T = unknown> {
  propertyName: string
  key: string
  metadata: T
  impl: boolean
}

/**
 * @returns {string[]} error messages
 */
export function checkMethodHasDecoratorKeys(
  targetDecoratorKeyMap: Map<string, string>, // 'docorator:method_key_trx' => 'Transactional'
  decoratorKeyMap: Map<string, string>, // 'docorator:method_key_cacheable' => 'Cacheable'
  target: {}, // class
  metaData: DecoratorMetaData,
): string[] {

  const ret: string[] = []

  const metadataArr: DecoratorMetaData[] | undefined = getClassMetadata(INJECT_CUSTOM_METHOD, target)
  if (! metadataArr?.length) {
    return ret
  }

  const {
    key, // 'docorator:method_key_trx'
    propertyName, // 'getUser'
  } = metaData

  decoratorKeyMap.forEach((id, dkey) => {
    if (methodHasDecorated(dkey, propertyName, metadataArr)) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const targetName = typeof target.name === 'string' && target.name
        // @ts-ignore
        ? target.name as string
        : target.constructor.name
      const targetId = targetDecoratorKeyMap.get(key) ?? '"Unknown decorator"'
      // assert(id, 'decorator id should be defined')

      const msg = `@${targetId}() should be used after @${id}() on the same method "${propertyName}".
target name: ${targetName}
metadata: ${JSON.stringify(metaData, null, 2)}`
      ret.push(msg)
    }
  })

  return ret
}
