import { execSync } from 'child_process'
import { join } from 'path'
import { getInput, debug, setFailed, setOutput } from '@actions/core'

const run = async (): Promise<void> => {
  try {
    // Get Inputs
    const prefix = getInput('prefix', { required: false })
    const extractPrefix = getInput('extract-prefix', { required: false })
    const from = getInput('from', { required: false })
    const to = getInput('to', { required: false })
    const workingDirectory = getInput('working-directory', { required: false })

    debug(`Inputs: ${JSON.stringify({ prefix, from, to, workingDirectory })}`)

    const json = execSync(
      `npx turbo run build ${from || to ? `--filter="[${from}...${to}]"` : ''} --dry-run=json`,
      {
        cwd: join(process.cwd(), workingDirectory),
        encoding: 'utf-8',
      },
    )

    debug(`Output from Turborepo: ${json}`)

    const parsedOutput = JSON.parse(json)
    const changedPackages = parsedOutput.packages.filter(
      (p: string) => !prefix || p.startsWith(prefix)
    ).map((p: string) => extractPrefix ? p.replace(prefix, "") : p);

    setOutput('changed', changedPackages)
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error)
    } else {
      setFailed('Unknown error occured.')
    }
  }
}

void run()