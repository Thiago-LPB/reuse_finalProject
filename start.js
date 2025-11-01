import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  { name: 'User Service', script: 'user-service/userService-db.js', port: 8082 },
  { name: 'Cart Service', script: 'cart-service/cartService-db.js', port: 8083 },
  { name: 'Recommendation Service', script: 'recommendation-service/recommendationService.js', port: 8084 },
  { name: 'Game Service', script: 'game-service/gameService.js', port: 8085 },
  { name: 'Gateway', script: 'gateway/app.js', port: 5000 }
];

const processes = [];

function startService(service) {
  console.log(`\n Starting ${service.name} on port ${service.port}...`);

  const proc = spawn('node', [service.script], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env }
  });

  proc.on('error', (err) => {
    console.error(` Error starting ${service.name}:`, err);
  });

  proc.on('exit', (code) => {
    console.log(`${service.name} exited with code ${code}`);
    if (code !== 0 && code !== null) {
      setTimeout(() => startService(service), 3000);
    }
  });

  processes.push({ name: service.name, process: proc });
}

console.log(' Starting Game Shop Microservices...\n');

services.forEach(service => {
  startService(service);
});

process.on('SIGINT', () => {
  console.log('\n\n Shutting down all services...');
  processes.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill();
  });
  process.exit(0);
});

process.on('SIGTERM', () => {
  processes.forEach(({ process }) => process.kill());
  process.exit(0);
});
