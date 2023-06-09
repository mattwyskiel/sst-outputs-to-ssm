import * as core from '@actions/core'
import {PutParameterCommand, SSMClient} from '@aws-sdk/client-ssm'
import {readFile} from 'fs/promises'

async function run(): Promise<void> {
  const ssm = new SSMClient({region: process.env.AWS_REGION})

  try {
    const fileName = core.getInput('outputs_path')
    const prefix = core.getInput('prefix')
    const outputsString = await readFile(
      `${process.env.GITHUB_WORKSPACE}/${fileName}`,
      {encoding: 'utf-8'}
    )
    const outputs = JSON.parse(outputsString)
    for (const stackName in outputs) {
      for (const outputName in outputs[stackName]) {
        const command = new PutParameterCommand({
          Name: `/${prefix}/${stackName}/${outputName}`,
          Value: outputs[stackName][outputName],
          Type: 'String',
          Overwrite: true
        })
        await ssm.send(command)
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
