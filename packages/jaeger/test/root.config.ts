import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { config } from './test.config'

import { Application } from '~/interface'
import { Config, MiddlewareConfig, TestSpanInfo } from '~/lib/types'


export type TestResponse = supertest.Response
export interface TestRespBody {
  header: IncomingHttpHeaders
  url: string
  config: Config
  mwConfig: MiddlewareConfig
  cookies: unknown
  spanInfo: TestSpanInfo
}

export interface TestConfig {
  app: Application
  config: Config
  host: string
  httpRequest: SuperTest<supertest.Test>
}
export const testConfig = {
  config,
  host: '',
} as TestConfig

