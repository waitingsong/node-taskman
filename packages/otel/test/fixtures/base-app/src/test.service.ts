import assert from 'assert'

import {
  Config as _Config,
  Provide,
} from '@midwayjs/core'

import { Trace } from '~/lib/trace.decorator'
import { Config, ConfigKey } from '~/lib/types'


@Provide()
export class DefaultComponentService {

  @_Config(ConfigKey.config) readonly config: Config

  @Trace(void 0, { startActiveSpan: false })
  async hello(input: string): Promise<string> {
    assert(typeof this.config.enable !== 'undefined')
    return input
  }

  async error(triggerError: boolean): Promise<string> {
    if (triggerError) {
      throw new Error('debug for DefaultComponentService.error()')
    }
    return 'OK'
  }

  /** Error will be traced cause decorator */
  @Trace()
  async traceError(triggerError: boolean): Promise<string> {
    if (triggerError) {
      throw new Error('debug for DefaultComponentService.error()')
    }
    return 'OK'
  }

}

