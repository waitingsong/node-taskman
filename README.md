# node-taskman


[![GitHub tag](https://img.shields.io/github/tag/waitingsong/node-taskman)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/node-taskman/workflows/ci/badge.svg)](https://github.com/waitingsong/node-taskman/actions?query=workflow%3A%22ci%22)
[![codecov](https://codecov.io/gh/waitingsong/node-taskman/branch/main/graph/badge.svg?token=lbfTIGwu6t)](https://codecov.io/gh/waitingsong/midway-components)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Note

ESM build only, requires `@midwayjs >= 3.12` and set `"type": "module"` in `packages.json`

## Packages

| Package     | Version                      |
| ----------- | ---------------------------- |
| [`taskman`] | [![taskman-svg]][taskman-ch] |


## Initialize and install dependencies

## 安装全局依赖
```sh
npm i -g c8 lerna rollup tsx zx
```

## Update package

```sh
npm i && npm run build
```

## Test

- Use `npm run lint` to check code style.
- Use `npm run test` to run unit test.

## Clan or Purge

```sh
# clean build dist, cache and build
npm run clean
# clean and remove all node_modules
npm run purge
```

## Note

- Run `npm run clean` before `npm run build`, if any file under typescript outDir folder was deleted manually.
- Default publish registry is `NPM`, configurated in file `lerna.json`
- Any commands above (such as `npm run build`) running in `Git-Bash` under Windows OS

## License
[MIT](LICENSE)


### Languages
- [English](README.md)
- [中文](README.zh-CN.md)

<br>

[Midway.js]: https://midwayjs.org/


[`taskman`]: https://github.com/waitingsong/midway-components/tree/main/packages/taskman
[taskman-svg]: https://img.shields.io/npm/v/@mwcp/taskman.svg?maxAge=7200
[taskman-ch]: https://github.com/waitingsong/midway-components/tree/main/packages/taskman/CHANGELOG.md


