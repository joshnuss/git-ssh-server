import fs from 'fs'
import path from 'path'
import { spawn, execSync } from 'child_process'

export default function session(accept, reject) {
  console.log('client:start')
  const session = accept()

  session.once('exec', (accept, reject, info) => {
    console.log(`client:exec ${info.command}`)
    const stream = accept()

    const {command, repo} = extractCommand(info)

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
  const repo = path.resolve('./repos/' + arg.replace(/(^')|('$)/g, '').replace(/^\//, ''))

  return {command, repo}
}

function missing(repo) {
  return !fs.existsSync(repo)
}

function create(repo) {
  console.log(`repo:create ${repo}`)
  execSync(`git init --bare ${repo}`)
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
