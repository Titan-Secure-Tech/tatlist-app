#!/usr/bin/env bun

import chalk from 'chalk'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

// Command registry
const commands: Record<string, { description: string; file: string }> = {
  dev: {
    description: 'Smart dev server manager - kills existing servers and starts fresh',
    file: 'dev.ts',
  },
  deploy: {
    description: 'Safe deployment pipeline - build, test, and deploy to Vercel',
    file: 'deploy.ts',
  },
  'square-test': {
    description: 'Test Square payment integration end-to-end',
    file: 'square-test.ts',
  },
  'db-status': {
    description: 'Check database health and connection status',
    file: 'db-status.ts',
  },
  fix: {
    description: 'Auto-fix common issues (TypeScript, formatting, deps)',
    file: 'fix.ts',
  },
}

function showHelp() {
  console.log(chalk.bold.blue('🚀 Tatlist Slash Commands\n'))
  console.log(chalk.gray('Available commands:\n'))

  Object.entries(commands).forEach(([name, info]) => {
    console.log(chalk.cyan(`  /${name}`))
    console.log(chalk.gray(`    ${info.description}\n`))
  })

  console.log(chalk.gray('Usage:'))
  console.log(chalk.white('  bun slash <command>'))
  console.log(chalk.white('  bun slash help\n'))

  console.log(chalk.gray('Examples:'))
  console.log(chalk.white('  bun slash dev        # Start dev server'))
  console.log(chalk.white('  bun slash deploy     # Deploy to Vercel'))
  console.log(chalk.white('  bun slash fix        # Fix common issues\n'))
}

function runCommand(commandName: string, args: string[] = []) {
  const command = commands[commandName]

  if (!command) {
    console.log(chalk.red(`❌ Unknown command: /${commandName}\n`))
    console.log(chalk.gray('Available commands:'))
    Object.keys(commands).forEach(name => {
      console.log(chalk.cyan(`  /${name}`))
    })
    process.exit(1)
  }

  const commandPath = path.join(__dirname, command.file)

  if (!fs.existsSync(commandPath)) {
    console.log(chalk.red(`❌ Command file not found: ${command.file}`))
    process.exit(1)
  }

  // Execute the command
  const child = spawn('bun', [commandPath, ...args], {
    stdio: 'inherit',
    env: { ...process.env },
  })

  child.on('error', error => {
    console.error(chalk.red(`❌ Failed to run /${commandName}:`), error)
    process.exit(1)
  })

  child.on('exit', code => {
    process.exit(code || 0)
  })
}

async function main() {
  const args = process.argv.slice(2)
  const commandName = args[0]
  const commandArgs = args.slice(1)

  if (!commandName || commandName === 'help' || commandName === '--help' || commandName === '-h') {
    showHelp()
    process.exit(0)
  }

  // Handle slash prefix (allow both /dev and dev)
  const cleanCommand = commandName.startsWith('/') ? commandName.slice(1) : commandName

  runCommand(cleanCommand, commandArgs)
}

main().catch(error => {
  console.error(chalk.red('❌ Error:'), error)
  process.exit(1)
})
