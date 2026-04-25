// ─────────────────────────────────────────────
// Tenmin — `budget` command
// Spending summary from order history
// ─────────────────────────────────────────────

import chalk from 'chalk';
import { getState } from '../store/index.js';
import { getTheme } from '../ui/themes.js';
import { getThemeName } from '../store/index.js';
import { banner, warn, hint, divider, info } from '../ui/format.js';
import type { OrderRecord } from '../types.js';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday as week start
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function groupByPeriod(
  orders: OrderRecord[],
  getKey: (d: Date) => string,
  getLabel: (key: string) => string,
): { label: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();

  for (const order of orders) {
    const d = new Date(order.timestamp);
    const key = getKey(d);
    const existing = map.get(key) ?? { total: 0, count: 0 };
    map.set(key, { total: existing.total + order.total, count: existing.count + 1 });
  }

  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 8)
    .map(([key, val]) => ({ label: getLabel(key), ...val }));
}

function bar(value: number, max: number, width = 20): string {
  const theme = getTheme(getThemeName());
  const filled = max === 0 ? 0 : Math.round((value / max) * width);
  const empty = width - filled;
  return (
    chalk.hex(theme.colors.accent)('█'.repeat(filled)) +
    chalk.hex(theme.colors.divider)('░'.repeat(empty))
  );
}

export async function budgetCommand(period?: string): Promise<void> {
  banner();

  const state = getState();
  const orders = state.orders;
  const theme = getTheme(getThemeName());

  if (orders.length === 0) {
    warn('No order history to analyse yet.');
    hint('Place your first order with `tenmin order <item>`.');
    console.log();
    return;
  }

  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now).getTime();
  const monthStart = startOfMonth(now).getTime();

  const ordersToday = orders.filter(
    (o) => new Date(o.timestamp).getTime() >= todayStart,
  );
  const ordersWeek = orders.filter(
    (o) => new Date(o.timestamp).getTime() >= weekStart,
  );
  const ordersMonth = orders.filter(
    (o) => new Date(o.timestamp).getTime() >= monthStart,
  );
  const totalAll = orders.reduce((s, o) => s + o.total, 0);

  console.log(chalk.bold.white('  📊 Spending Summary'));
  divider();

  // ── Snapshot table ─────────────────────────
  const rows: [string, string, string][] = [
    ['Today', String(ordersToday.length), `₹${ordersToday.reduce((s, o) => s + o.total, 0)}`],
    ['This week', String(ordersWeek.length), `₹${ordersWeek.reduce((s, o) => s + o.total, 0)}`],
    ['This month', String(ordersMonth.length), `₹${ordersMonth.reduce((s, o) => s + o.total, 0)}`],
    ['All time', String(orders.length), `₹${totalAll}`],
  ];

  for (const [label, count, spend] of rows) {
    const labelPad = label.padEnd(14);
    const countStr = chalk.hex(theme.colors.secondary)(`${count} order${Number(count) === 1 ? '' : 's'}`);
    const spendStr = chalk.hex(theme.colors.price).bold(spend);
    console.log(`  ${chalk.hex(theme.colors.secondary)(labelPad)}${countStr.padEnd(20)}${spendStr}`);
  }

  // ── Top items ──────────────────────────────
  console.log();
  divider();
  console.log(chalk.bold.white('  🏆 Top Items'));
  console.log();

  const itemMap = new Map<string, { name: string; qty: number; spend: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = itemMap.get(item.name) ?? { name: item.name, qty: 0, spend: 0 };
      itemMap.set(item.name, {
        name: item.name,
        qty: existing.qty + item.qty,
        spend: existing.spend + item.price * item.qty,
      });
    }
  }

  const topItems = [...itemMap.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxQty = topItems[0]?.qty ?? 1;

  for (const item of topItems) {
    const barStr = bar(item.qty, maxQty, 16);
    console.log(
      `  ${barStr}  ${chalk.white(item.name)}` +
      chalk.dim(`  ×${item.qty}  `) +
      chalk.hex(theme.colors.price)(`₹${item.spend}`),
    );
  }

  // ── Weekly trend ───────────────────────────
  if (orders.length > 2) {
    console.log();
    divider();
    console.log(chalk.bold.white('  📈 Weekly Trend'));
    console.log();

    const weeklyGroups = groupByPeriod(
      orders,
      (d) => {
        const ws = startOfWeek(d);
        return ws.toISOString().slice(0, 10);
      },
      (key) => {
        const d = new Date(key);
        return `Week of ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
      },
    );

    const maxWeeklyTotal = Math.max(...weeklyGroups.map((w) => w.total));

    for (const week of weeklyGroups) {
      const barStr = bar(week.total, maxWeeklyTotal, 16);
      console.log(
        `  ${barStr}  ${chalk.hex(theme.colors.secondary)(week.label.padEnd(20))}` +
        chalk.hex(theme.colors.price).bold(`₹${week.total}`),
      );
    }
  }

  divider();
  console.log();
}
