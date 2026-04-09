const { spawn } = require('node:child_process');

const children = [];
let isShuttingDown = false;

const run = (command, args, options = {}) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });

  children.push(child);

  child.on('exit', (code) => {
    if (!isShuttingDown && code && code !== 0) {
      shutdown(code);
    }
  });

  return child;
};

const shutdown = (code = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }

  setTimeout(() => process.exit(code), 250);
};

run('npm', ['run', 'dev']);
run('npm', ['run', 'electron:dev:main']);

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
