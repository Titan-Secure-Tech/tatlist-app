#!/usr/bin/env bun

import { execSync } from 'child_process'
import chalk from 'chalk'
import fs from 'fs'

interface FixResult {
  task: string
  success: boolean
  message: string
  fixed?: boolean
}

const results: FixResult[] = []

function runFix(task: string, command: string, checkCommand?: string): boolean {
  console.log(chalk.cyan(`🔧 ${task}...`))

  try {
    // Run check command first if provided
    if (checkCommand) {
      try {
        execSync(checkCommand, { stdio: 'pipe' })
        console.log(chalk.gray(`   No issues found`))
        results.push({ task, success: true, message: 'No issues found', fixed: false })
        return true
      } catch {
        console.log(chalk.yellow(`   Issues detected, attempting fix...`))
      }
    }

    // Run the fix command
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' })

    console.log(chalk.green(`   ✅ Fixed successfully`))
    if (output && output.trim()) {
      console.log(chalk.gray(`   ${output.trim().split('\n')[0]}`))
    }

    results.push({ task, success: true, message: 'Fixed successfully', fixed: true })
    return true
  } catch (error: unknown) {
    const err = error as { stderr?: string; stdout?: string; message?: string }
    const errorMessage = err.stderr || err.stdout || err.message || 'Unknown error'
    console.log(chalk.red(`   ❌ Failed to fix`))
    console.log(chalk.gray(`   ${errorMessage.split('\n')[0]}`))

    results.push({ task, success: false, message: errorMessage.split('\n')[0] })
    return false
  }
}

function clearCaches() {
  console.log(chalk.cyan('🗑️  Clearing caches...'))

  const cacheDirs = ['.next', 'node_modules/.cache', '.turbo']

  let cleared = 0

  for (const dir of cacheDirs) {
    if (fs.existsSync(dir)) {
      try {
        execSync(`rm -rf ${dir}`, { stdio: 'pipe' })
        console.log(chalk.gray(`   Cleared ${dir}`))
        cleared++
      } catch {
        console.log(chalk.yellow(`   Could not clear ${dir}`))
      }
    }
  }

  if (cleared > 0) {
    console.log(chalk.green(`   ✅ Cleared ${cleared} cache directories`))
    results.push({
      task: 'Clear caches',
      success: true,
      message: `Cleared ${cleared} directories`,
      fixed: true,
    })
  } else {
    console.log(chalk.gray(`   No caches to clear`))
    results.push({ task: 'Clear caches', success: true, message: 'No caches found', fixed: false })
  }

  return true
}

function installDependencies() {
  console.log(chalk.cyan('📦 Checking dependencies...'))

  // Check if package-lock.json is out of sync
  try {
    execSync('bun install --frozen-lockfile', { stdio: 'pipe' })
    console.log(chalk.gray('   Dependencies up to date'))
    results.push({ task: 'Dependencies', success: true, message: 'Up to date', fixed: false })
    return true
  } catch {
    console.log(chalk.yellow('   Updating dependencies...'))
    try {
      execSync('bun install', { stdio: 'pipe' })
      console.log(chalk.green('   ✅ Dependencies updated'))
      results.push({
        task: 'Dependencies',
        success: true,
        message: 'Updated successfully',
        fixed: true,
      })
      return true
    } catch {
      console.log(chalk.red('   ❌ Failed to update'))
      results.push({ task: 'Dependencies', success: false, message: 'Update failed' })
      return false
    }
  }
}

function fixPermissions() {
  console.log(chalk.cyan('🔐 Fixing file permissions...'))

  try {
    // Make scripts executable
    const scriptsDir = 'scripts'
    if (fs.existsSync(scriptsDir)) {
      execSync(`chmod +x ${scriptsDir}/*.ts 2>/dev/null || true`, { stdio: 'pipe' })
    }

    // Make slash commands executable
    const slashDir = 'slash-commands'
    if (fs.existsSync(slashDir)) {
      execSync(`chmod +x ${slashDir}/*.ts 2>/dev/null || true`, { stdio: 'pipe' })
    }

    console.log(chalk.green('   ✅ Permissions fixed'))
    results.push({
      task: 'File permissions',
      success: true,
      message: 'Fixed successfully',
      fixed: true,
    })
    return true
  } catch {
    console.log(chalk.yellow('   ⚠️  Some permissions could not be fixed'))
    results.push({
      task: 'File permissions',
      success: true,
      message: 'Partially fixed',
      fixed: true,
    })
    return true
  }
}

async function main() {
  console.log(chalk.bold.blue('🚀 Tatlist Auto-Fixer\n'))
  console.log(chalk.gray('Detecting and fixing common issues...\n'))

  // 1. TypeScript errors
  runFix('TypeScript errors', 'bunx tsc --noEmit', 'bunx tsc --noEmit')

  console.log()

  // 2. Code formatting
  runFix(
    'Code formatting',
    'bun run format:write',
    'bunx prettier --check "**/*.{ts,tsx,js,jsx,mdx}"'
  )

  console.log()

  // 3. ESLint issues
  runFix('ESLint issues', 'bunx eslint . --fix', 'bunx eslint .')

  console.log()

  // 4. Dependencies
  installDependencies()

  console.log()

  // 5. Clear caches if there were build issues
  const hadErrors = results.some(r => !r.success)
  if (hadErrors) {
    clearCaches()
    console.log()
  }

  // 6. Fix permissions
  fixPermissions()

  // Summary
  console.log(chalk.bold('\n📊 Fix Summary'))
  console.log(chalk.gray('────────────\n'))

  const fixed = results.filter(r => r.fixed).length
  const failed = results.filter(r => !r.success).length

  results.forEach(result => {
    let icon, color

    if (!result.success) {
      icon = '❌'
      color = chalk.red
    } else if (result.fixed) {
      icon = '✅'
      color = chalk.green
    } else {
      icon = '✓'
      color = chalk.gray
    }

    console.log(color(`${icon} ${result.task}: ${result.message}`))
  })

  console.log()

  if (failed === 0) {
    if (fixed > 0) {
      console.log(chalk.bold.green(`🎉 Fixed ${fixed} issue${fixed > 1 ? 's' : ''}!`))
    } else {
      console.log(chalk.bold.green('✨ Everything looks good!'))
    }

    // Try to build after fixes
    if (fixed > 0) {
      console.log(chalk.cyan('\n🏗️  Testing build after fixes...'))
      try {
        execSync('bun run build', { stdio: 'inherit' })
        console.log(chalk.bold.green('\n✅ Build successful!'))
      } catch {
        console.log(
          chalk.yellow('\n⚠️  Build still has issues. Run "bun run build" to see details.')
        )
      }
    }
  } else {
    console.log(
      chalk.yellow(`⚠️  ${failed} issue${failed > 1 ? 's' : ''} could not be fixed automatically`)
    )
    console.log(chalk.gray('\nYou may need to fix these manually.'))
  }
}

main().catch(error => {
  console.error(chalk.red('❌ Error:'), error)
  process.exit(1)
})
