pbg
=================

pbg cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pbg.svg)](https://npmjs.org/package/pbg)
[![Downloads/week](https://img.shields.io/npm/dw/pbg.svg)](https://npmjs.org/package/pbg)
[![License](https://img.shields.io/npm/l/pbg.svg)](https://github.com/NurbekGithub/pbg/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g pbg
$ pbg COMMAND
running command...
$ pbg (-v|--version|version)
pbg/0.0.4 linux-x64 node-v14.15.3
$ pbg --help [COMMAND]
USAGE
  $ pbg COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pbg default-all [OUTFOLDERPATH]`](#pbg-default-all-outfolderpath)
* [`pbg help [COMMAND]`](#pbg-help-command)
* [`pbg init [OUTFOLDERPATH]`](#pbg-init-outfolderpath)
* [`pbg model [OUTFOLDERPATH]`](#pbg-model-outfolderpath)
* [`pbg pull [FILE]`](#pbg-pull-file)

## `pbg default-all [OUTFOLDERPATH]`

generate routes, services and types for all prisma models

```
USAGE
  $ pbg default-all [OUTFOLDERPATH]

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ prisma-boilerplate-generator default-all [OUT_FOLDER_PATH]
```

_See code: [src/commands/default-all.ts](https://github.com/NurbekGithub/pbg/blob/v0.0.4/src/commands/default-all.ts)_

## `pbg help [COMMAND]`

display help for pbg

```
USAGE
  $ pbg help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `pbg init [OUTFOLDERPATH]`

init template

```
USAGE
  $ pbg init [OUTFOLDERPATH]

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ prisma-boilerplate-generator init [OUT_FOLDER_PATH]
```

_See code: [src/commands/init.ts](https://github.com/NurbekGithub/pbg/blob/v0.0.4/src/commands/init.ts)_

## `pbg model [OUTFOLDERPATH]`

generate routes, services and types for all models

```
USAGE
  $ pbg model [OUTFOLDERPATH]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ prisma-boilerplate-generator default-all
```

_See code: [src/commands/model.ts](https://github.com/NurbekGithub/pbg/blob/v0.0.4/src/commands/model.ts)_

## `pbg pull [FILE]`

describe the command here

```
USAGE
  $ pbg pull [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ prisma-boilerplate-generator pull
```

_See code: [src/commands/pull.ts](https://github.com/NurbekGithub/pbg/blob/v0.0.4/src/commands/pull.ts)_
<!-- commandsstop -->
