import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import {
  App,
  Config,
  Configuration,
  ILifeCycle,
  Inject,
  Logger,
  MidwayDecoratorService,
  MidwayInformationService,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import {
  Application,
  AroundFactoryOptionsBase,
  IMidwayContainer,
  RegisterDecoratorHandlerOptions,
  registerDecoratorHandler,
} from '@mwcp/share'
import { node } from '@opentelemetry/sdk-node'
import { sleep } from '@waiting/shared-core'
import type { NpmPkg } from '@waiting/shared-types'


import { useComponents } from './imports'
import { OtelComponent } from './lib/component'
import { decoratorExecutor } from './lib/trace-init/helper.trace-init'
import { METHOD_KEY_TraceInit } from './lib/trace-init/trace-init'
import { registerMethodHandler } from './lib/trace.decorator'
import { genDecoratorExecutorOptions } from './lib/trace.helper'
import {
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
  TraceDecoratorArg,
} from './lib/types'
import {
  TraceMiddlewareInner,
  TraceMiddleware,
} from './middleware/index.middleware'


const otelPkgPath = join(__dirname, '../package.json')

@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Config(ConfigKey.config) protected readonly config: Conf
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() decoratorService: MidwayDecoratorService
  @Logger() logger: ILogger

  protected spanProcessors: node.SpanProcessor[] = []
  protected provider: node.BasicTracerProvider | undefined

  protected otelLibraryName: string
  protected otelLibraryVersion: string

  async onConfigLoad(): Promise<unknown> {
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    let pkg: NpmPkg | undefined
    const informationService = await this.app.getApplicationContext().getAsync(MidwayInformationService)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (informationService) {
      pkg = informationService.getPkg() as NpmPkg
    }
    let serviceName = this.config.serviceName
      ? this.config.serviceName
      : pkg?.name ?? `unknown-${new Date().toLocaleDateString()}`
    serviceName = serviceName.replace('@', '').replace(/\//ug, '-')

    const ver = this.config.serviceVersion
      ? this.config.serviceVersion
      : pkg?.version ?? ''

    this.config.serviceName = serviceName
    this.config.serviceVersion = ver

    return
  }

  async onReady(): Promise<void> {
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    const { name, version } = await import(otelPkgPath) as NpmPkg
    assert(name, 'package file of otel not found')
    assert(version, 'package file of otel not found')

    if (this.config.enableDefaultRoute && this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/${ConfigKey.namespace}/.+`, 'u'))
    }

    const otel = await this.app.getApplicationContext().getAsync(OtelComponent, [ { name, version } ])
    assert(otel, 'otel must be set')
    const key = `_${ConfigKey.componentName}`
    // @ts-ignore
    if (typeof this.app[key] === 'undefined') {
      // @ts-ignore
      this.app[key] = otel
    }
    // @ts-ignore
    else if (this.app[key] !== otel) {
      throw new Error(`this.app.${key} not equal to otel`)
    }

    // const decoratorService = await this.app.getApplicationContext().getAsync(MidwayDecoratorService)
    // assert(decoratorService === this.decoratorService)
    registerMethodHandler(this.decoratorService, this.config)


    const aroundFactoryOptions: AroundFactoryOptionsBase = {
      config: this.config,
      webApplication: this.app,
    }
    const optsTraceInit: RegisterDecoratorHandlerOptions<TraceDecoratorArg> = {
      decoratorKey: METHOD_KEY_TraceInit,
      decoratorService: this.decoratorService,
      // @ts-expect-error
      decoratorExecutor,
      genDecoratorExecutorOptionsFn: genDecoratorExecutorOptions,
    }
    registerDecoratorHandler(optsTraceInit, aroundFactoryOptions)


    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddlewareInner, 'last')
    }

    otel.addAppInitEvent({
      event: `${ConfigKey.componentName}.onReady.end`,
    })
  }

  async onServerReady(container: IMidwayContainer): Promise<void> {
    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddleware, 'first')
    }

    const mwNames = this.app.getMiddleware().getNames()

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    void setTimeout(async () => {
      const otel = await container.getAsync(OtelComponent)
      otel.addAppInitEvent({
        event: `${ConfigKey.componentName}.onServerReady.end`,
        mwNames: JSON.stringify(mwNames),
      })
      otel.endAppInitEvent()
    }, 0)
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    this.logger.info('[otel] onStop()')
    const otel = await container.getAsync(OtelComponent)
    await sleep(1000)
    await otel.shutdown()
  }

}

function registerMiddleware(
  app: Application,
  middleware: { name: string },
  postion: 'first' | 'last' = 'last',
): void {

  const mwNames = app.getMiddleware().getNames()
  if (mwNames.includes(middleware.name)) {
    return
  }

  switch (postion) {
    case 'first':
      // @ts-ignore
      app.getMiddleware().insertFirst(middleware)
      break
    case 'last':
      // @ts-ignore
      app.getMiddleware().insertLast(middleware)
      break
  }
}


