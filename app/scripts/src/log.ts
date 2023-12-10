import colors from 'kleur';
import type { Message } from 'esbuild';
import { Options } from './types';

export const ARROW = '   ~> ';
export const SPACER = ' '.repeat(6);
const CFW = colors.bold('[WRANGLE]');

export function print(color: keyof colors.Kleur, msg: string): void {
  console.log(
    colors[color](CFW),
    msg.includes('\n') ? msg.replace(/(\r?\n)/g, '$1' + SPACER) : msg
  );
}

export const info = (msg: string) => {
  console.log(colors.cyan(ARROW), 'info');
  print('white', msg);
};

export const success = (msg: string) => print('green', msg);
export const warn = (msg: string) => print('yellow', msg);

export function error(msg: string, code = 1): never | false {
  print('red', msg);
  if (code === 0) return false;
  process.exit(code);
}

const FLAG = colors.dim().bold;
export function missing(text: string, opts: Partial<Options>) {
  if (opts.only || opts.ignore)
    text += `\nPerhaps the ${FLAG('--only')} or ${FLAG('--ignore')} flag needs adjusting`;
  return warn(text);
}

export function time(ms: number) {
  return colors.italic().dim(` (${ms}ms)`);
}

export function item(name: string, delta?: number, isAdd?: boolean) {
  let sym = '•',
    fn = colors.dim;
  let text = delta != null ? time(delta) : '';
  if (isAdd) (sym = '+'), (fn = colors.green().dim);
  else if (isAdd != null) (sym = '-'), (fn = colors.red().dim);
  console.log(fn(SPACER + sym + ` "${name}"`) + text);
}

// format esbuild errors/warnings
export async function messages(arr: Message[], isError?: boolean) {
  let i = 0,
    count = arr.length;
  if (count === i) return;

  const esbuild = await import('esbuild');

  let frames = await esbuild.formatMessages(arr, {
    terminalWidth: process.stdout.columns,
    kind: isError ? 'error' : 'warning',
    color: colors.enabled,
  });

  let rgx = /\x1b\[32m/g; // replace ANSI green
  let color = isError ? '\u001b[31m' : '\u001b[33m'; // red|yellow
  let fmt = isError ? colors.red : colors.yellow;

  let output = `Build ${isError ? 'failed' : 'finished'} with`;
  output += ' ' + colors.underline(count) + ' ';
  output += isError ? 'error' : 'warning';
  output += count === 1 ? ':' : 's:';
  output += '\n\n';

  for (; i < count; i++) {
    output += colors.bold().inverse(fmt(' ' + arr[i].location!.file + ' ')) + ' ' + arr[i].text;
    output += frames[i].substring(frames[i].indexOf('\n')).replace(rgx, color);
  }

  i = output.length;
  if (output[--i] === '\n') {
    output = output.substring(0, i);
  }

  (isError ? error : warn)(output);
}

function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function printList<T extends Record<string, any>>(list: T[], columnNames: (keyof T)[]) {
  const columnHeadings: { [K in keyof T]: string } = {} as { [K in keyof T]: string };

  columnNames.forEach((columnName) => {
    columnHeadings[columnName] = String(columnName);
  });

  const GAP = '    ',
    TH = colors.dim().bold().italic;

  const columnLengths: { [K in keyof T]: number } = {} as { [K in keyof T]: number };
  const HEADING_GAP = GAP.repeat(columnNames.length);
  // const HEADING_GAP = GAP.repeat(columnNames.length * 3 - (columnNames.length + 1));

  columnNames.forEach((columnName) => {
    const maxColumnLength = Math.max(
      ...list.map((item) => String(item[columnName]).length),
      String(columnHeadings[columnName]).length
    );
    columnLengths[columnName] = maxColumnLength;
  });

  const heading = columnNames
    .map((columnName) =>
      TH(toTitleCase(columnHeadings[columnName])).padEnd(
        columnLengths[columnName] + HEADING_GAP.length
      )
    )
    .join(HEADING_GAP);

  success(heading);

  let i = 0,
    arr = list,
    tmp = '';

  for (; i < arr.length; i++) {
    if (tmp) tmp += '\n';
    tmp += colors.cyan(ARROW);
    tmp += columnNames
      .map((columnName) =>
        String(arr[i][columnName]).padEnd(columnLengths[columnName] + GAP.length)
      )
      .join(GAP);
  }

  console.log(tmp);
}

export function printList2<T extends Record<string, any>>(list: T[], columnNames: (keyof T)[]) {
  const columnHeadings: { [K in keyof T]: string } = {} as { [K in keyof T]: string };

  columnNames.forEach((columnName) => {
    columnHeadings[columnName] = String(columnName);
  });

  const GAP = '    ',
    TH = colors.dim().bold().italic;

  const columnLengths: { [K in keyof T]: number } = {} as { [K in keyof T]: number };

  // Calculate the maximum length for each column
  columnNames.forEach((columnName) => {
    const maxColumnLength = Math.max(
      ...list.map((item) => String(item[columnName]).length),
      String(columnHeadings[columnName]).length
    );
    columnLengths[columnName] = maxColumnLength;
  });

  const HEADING_GAP = GAP.repeat(columnNames.length * 3 - (columnNames.length + 1));
  // const HEADING_GAP = GAP.repeat(columnNames.length * 3 - (columnNames.length - 1));
  // Generate the header with padding based on max item length in each column
  const heading = columnNames
    .map((columnName) => {
      const maxItemLength = Math.max(
        ...list.map((item) => String(item[columnName]).length),
        String(columnHeadings[columnName]).length
      );
      return TH(toTitleCase(columnHeadings[columnName])).padEnd(maxItemLength + GAP.length);
    })
    .join(HEADING_GAP);

  success(heading);

  // Output rows with appropriate padding based on the calculated lengths
  let i = 0,
    arr = list,
    tmp = '';

  for (; i < arr.length; i++) {
    if (tmp) tmp += '\n';
    tmp += colors.cyan(ARROW);
    tmp += columnNames
      .map((columnName) =>
        String(arr[i][columnName]).padEnd(columnLengths[columnName] + GAP.length)
      )
      .join(GAP);
  }

  console.log(tmp);
}
