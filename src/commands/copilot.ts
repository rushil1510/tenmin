import ora from 'ora';
import chalk from 'chalk';
import { password } from '@inquirer/prompts';
import { getGeminiKey, saveGeminiKey } from '../store/config.js';
import { runAgent } from '../agent/executor.js';
import { banner, success, warn, error, divider } from '../ui/format.js';

// ── API key resolution ────────────────────────

async function resolveApiKey(): Promise<string | null> {
  const existing = getGeminiKey();
  if (existing) return existing;

  console.log();
  console.log(chalk.dim('  tenmin copilot uses Gemini to act as an agent.'));
  console.log(
    chalk.dim('  Get a free API key at ') +
    chalk.cyan('aistudio.google.com') +
    chalk.dim(' → "Get API key"'),
  );
  console.log();

  let key: string;
  try {
    key = await password({ message: 'Paste your Gemini API key:' });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') return null;
    throw err;
  }

  if (!key.trim()) return null;

  saveGeminiKey(key);
  console.log();
  success('API key saved to ~/.tenmin/config.json');
  console.log();

  return key.trim();
}

// ── Main command ──────────────────────────────

export async function copilotCommand(query: string): Promise<void> {
  banner();

  const apiKey = await resolveApiKey();
  if (!apiKey) {
    warn('No API key provided. Run `tenmin copilot` again to set one.');
    console.log();
    return;
  }

  const spinner = ora({
    text: chalk.dim('Thinking...'),
    indent: 2,
  }).start();

  try {
    const result = await runAgent(query, apiKey);
    spinner.stop();
    
    console.log();
    divider();
    console.log(chalk.cyan.bold('  Agent:'));
    console.log(`  ${result.replace(/\n/g, '\n  ')}`);
    divider();
    console.log();
    
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : 'Failed to run agent.');
    return;
  }
}
