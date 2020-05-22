import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { spawn, execSync } from 'child_process'

const allowedCommands = [
  "git-receive-pack",
  "git-upload-pack"
]

export default function session(accept, reject) {
  console.log('client:start')
  const session = accept()

  session.once('exec', (accept, reject, info) => {
    console.log(`client:exec ${info.command}`)
    const {command, repo} = extractCommand(info)

    if (!allowedCommands.includes(command)) {
      console.log(`error:rejected ${command}`)
      return reject()
    }

    const stream = accept()

    if (missing(repo)) {
      create(repo)
    } else {
      console.log(`repo:exists ${repo}`)
    }

    pipe(stream, command, [repo])
  })
}

function extractCommand(info) {
  const [command, arg] = info.command.split(' ')
  const repo = arg ? path.resolve('./repos/' + arg.replace(/(^')|('$)/g, '').replace(/^\//, '')) : null

  return {command, repo}
}

function missing(repo) {
  return !fs.existsSync(repo)
}

function create(repo) {
  console.log(`repo:create ${repo}`)
  execSync(`git init --bare ${repo}`)

  symlinkHooks(repo)
}

function symlinkHooks(repo) {
  glob.sync('hooks/*').forEach(hook => {
    const absolutePath = path.resolve(hook)
    const link = path.resolve(repo, hook)

    fs.symlinkSync(absolutePath, link)
  })
}

function pipe(stream, command, args = []) {
  const child = spawn(command, args)

  stream.stdout.pipe(child.stdin)
  child.stdout.pipe(stream.stdin, { end: false })
  child.stderr.pipe(stream.stderr)

  child.on('exit', code => {
    stream.exit(code)
    stream.end()
  })
}
