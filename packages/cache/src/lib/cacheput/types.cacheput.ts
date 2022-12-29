/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CacheManager } from '@midwayjs/cache'
import type { Context as WebContext } from '@mwcp/share'

import type { CacheableArgs } from '../types'


export interface DecoratorExecutorOptions extends CacheableArgs {
  cacheManager?: CacheManager | undefined
  method: (...args: unknown[]) => unknown
  methodArgs: unknown[]
  methodResult?: any
  webContext: WebContext
}


