#!/usr/bin/env bun

import { spawn, execSync } from 'child_process'
import chalk from 'chalk'

const DEV_PORT = 7500

async function killExistingServers() {
  try {
    // Find all processes using port 7500
    const result = execSync(`lsof -ti:${DEV_PORT}`, { encoding: 'utf-8' })
    const pids = result.trim().split('\n').filter(Boolean)

    if (pids.length > 0) {
      console.log(
        chalk.yellow(`🔄 Found ${pids.length} existing dev server(s) on port ${DEV_PORT}`)
      )
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`)
          console.log(chalk.gray(`   Killed process ${pid}`))
        } catch {
          // Process might have already ended
        }
      }
      console.log(chalk.green('✅ Cleaned up existing servers'))
      // Wait a moment for ports to be released
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch {
    // No processes found on port, which is fine
  }
}

async function startDevServer() {
  console.log(chalk.cyan('🚀 Starting Tatlist development server...'))
  console.log(chalk.gray(`   Port: ${DEV_PORT}`))
  console.log(chalk.gray('   Using Turbopack for fast refresh\n'))

  const devProcess = spawn('bun', ['dev'], {
    stdio: 'inherit',
    env: { ...process.env },
  })

  devProcess.on('error', error => {
    console.error(chalk.red('❌ Failed to start dev server:'), error)
    process.exit(1)
  })

  devProcess.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.log(chalk.yellow(`⚠️  Dev server exited with code ${code}`))
    }
  })

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down dev server...'))
    devProcess.kill('SIGTERM')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    devProcess.kill('SIGTERM')
    process.exit(0)
  })
}

async function main() {
  console.log(chalk.bold.blue('🔧 Tatlist Dev Server Manager\n'))

  // Kill any existing servers first
  await killExistingServers()

  // Start the dev server
  await startDevServer()
}

main().catch(error => {
  console.error(chalk.red('❌ Error:'), error)
  process.exit(1)
})
