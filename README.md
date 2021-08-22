prisma-boilerplate-generator
=================

prisma-boilerplate-generator cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/prisma-boilerplate-generator.svg)](https://npmjs.org/package/prisma-boilerplate-generator)
[![Downloads/week](https://img.shields.io/npm/dw/prisma-boilerplate-generator.svg)](https://npmjs.org/package/prisma-boilerplate-generator)
[![License](https://img.shields.io/npm/l/prisma-boilerplate-generator.svg)](https://github.com/NurbekGithub/prisma-boilerplate-generator/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g prisma-boilerplate-generator
$ prisma-boilerplate-generator COMMAND
running command...
$ prisma-boilerplate-generator (-v|--version|version)
prisma-boilerplate-generator/0.0.1 linux-x64 node-v14.15.3
$ prisma-boilerplate-generator --help [COMMAND]
USAGE
  $ prisma-boilerplate-generator COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`prisma-boilerplate-generator default-all [OUTFOLDERPATH]`](#prisma-boilerplate-generator-default-all-outfolderpath)
* [`prisma-boilerplate-generator help [COMMAND]`](#prisma-boilerplate-generator-help-command)
* [`prisma-boilerplate-generator model [OUTFOLDERPATH]`](#prisma-boilerplate-generator-model-outfolderpath)
* [`prisma-boilerplate-generator pull [FILE]`](#prisma-boilerplate-generator-pull-file)
* [`prisma-boilerplate-generator test [OUTFOLDERPATH]`](#prisma-boilerplate-generator-test-outfolderpath)

## `prisma-boilerplate-generator default-all [OUTFOLDERPATH]`

generate routes, services and types for all models

```
USAGE
  $ prisma-boilerplate-generator default-all [OUTFOLDERPATH]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ prisma-boilerplate-generator default-all
```

_See code: [src/commands/default-all.ts](https://github.com/NurbekGithub/prisma-boilerplate-generator/blob/v0.0.1/src/commands/default-all.ts)_

## `prisma-boilerplate-generator help [COMMAND]`

display help for prisma-boilerplate-generator

```
USAGE
  $ prisma-boilerplate-generator help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `prisma-boilerplate-generator model [OUTFOLDERPATH]`

generate routes, services and types for all models

```
USAGE
  $ prisma-boilerplate-generator model [OUTFOLDERPATH]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ prisma-boilerplate-generator default-all
```

_See code: [src/commands/model.ts](https://github.com/NurbekGithub/prisma-boilerplate-generator/blob/v0.0.1/src/commands/model.ts)_

## `prisma-boilerplate-generator pull [FILE]`

describe the command here

```
USAGE
  $ prisma-boilerplate-generator pull [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ prisma-boilerplate-generator pull
```

_See code: [src/commands/pull.ts](https://github.com/NurbekGithub/prisma-boilerplate-generator/blob/v0.0.1/src/commands/pull.ts)_

## `prisma-boilerplate-generator test [OUTFOLDERPATH]`

describe the command here

```
USAGE
  $ prisma-boilerplate-generator test [OUTFOLDERPATH]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ prisma-boilerplate-generator pull
```

_See code: [src/commands/test.ts](https://github.com/NurbekGithub/prisma-boilerplate-generator/blob/v0.0.1/src/commands/test.ts)_
<!-- commandsstop -->
