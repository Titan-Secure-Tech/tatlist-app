#!/usr/bin/env bun

import { execSync } from 'child_process'
import chalk from 'chalk'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

function runCommand(command: string, description: string): boolean {
  try {
    console.log(chalk.cyan(`📦 ${description}...`))
    execSync(command, { stdio: 'inherit' })
    console.log(chalk.green(`✅ ${description} completed\n`))
    return true
  } catch {
    console.error(chalk.red(`❌ ${description} failed`))
    return false
  }
}

function checkEnvVariables(): boolean {
  console.log(chalk.cyan('🔍 Checking environment variables...'))

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SQUARE_SANDBOX_ACCESS_TOKEN',
    'SQUARE_SANDBOX_APPLICATION_ID',
    'SQUARE_SANDBOX_LOCATION_ID',
    'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
  ]

  const missing: string[] = []

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName)
      console.log(chalk.yellow(`   ⚠️  Missing: ${varName}`))
    } else {
      console.log(chalk.gray(`   ✓ ${varName}`))
    }
  }

  if (missing.length > 0) {
    console.log(chalk.yellow('\n⚠️  Some environment variables are missing'))
    console.log(chalk.gray('   These should be configured in Vercel for production'))
    return false
  }

  console.log(chalk.green('✅ All environment variables configured\n'))
  return true
}

async function deployToVercel(target: 'preview' | 'production') {
  const command = target === 'production' ? 'vercel --prod' : 'vercel'
  const targetName = target === 'production' ? 'Production' : 'Preview'

  console.log(chalk.bold.cyan(`\n🚀 Deploying to ${targetName}...\n`))

  try {
    execSync(command, { stdio: 'inherit' })
    console.log(chalk.bold.green(`\n✅ Successfully deployed to ${targetName}!`))

    // Get the deployment URL
    try {
      const url = execSync('vercel ls --limit 1', { encoding: 'utf-8' })
      const lines = url.split('\n')
      if (lines.length > 1) {
        console.log(chalk.cyan(`\n🔗 Deployment URL: ${lines[1].trim()}`))
      }
    } catch {
      // Couldn't get URL, but deployment succeeded
    }

    return true
  } catch {
    console.error(chalk.red(`\n❌ Deployment to ${targetName} failed`))
    return false
  }
}

async function main() {
  console.log(chalk.bold.blue('🚢 Tatlist Deployment Pipeline\n'))

  // Step 1: Check environment variables
  checkEnvVariables()

  // Step 2: Run build check
  console.log(chalk.bold('Step 1: Build Check'))
  console.log(chalk.gray('────────────────────\n'))

  if (!runCommand('bun run build', 'Building application')) {
    console.log(chalk.red('\n❌ Build failed. Please fix errors before deploying.'))
    rl.close()
    process.exit(1)
  }

  // Step 3: Run type check
  console.log(chalk.bold('Step 2: Type Check'))
  console.log(chalk.gray('────────────────────\n'))

  if (!runCommand('bunx tsc --noEmit', 'Type checking')) {
    const answer = await question(chalk.yellow('⚠️  Type errors found. Continue anyway? (y/N): '))
    if (answer.toLowerCase() !== 'y') {
      console.log(chalk.yellow('Deployment cancelled.'))
      rl.close()
      process.exit(0)
    }
  }

  // Step 4: Choose deployment target
  console.log(chalk.bold('Step 3: Deployment Target'))
  console.log(chalk.gray('────────────────────────\n'))

  const target = await question(chalk.cyan('Deploy to (p)review or (P)roduction? [p/P]: '))

  const isProduction = target === 'P'

  if (isProduction) {
    const confirm = await question(
      chalk.yellow('⚠️  Deploy to PRODUCTION? Type "deploy" to confirm: ')
    )

    if (confirm !== 'deploy') {
      console.log(chalk.yellow('Production deployment cancelled.'))
      rl.close()
      process.exit(0)
    }
  }

  // Step 5: Deploy
  await deployToVercel(isProduction ? 'production' : 'preview')

  rl.close()
}

main().catch(error => {
  console.error(chalk.red('❌ Error:'), error)
  rl.close()
  process.exit(1)
})
