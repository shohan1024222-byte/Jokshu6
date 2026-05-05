const { spawn } = require('node:child_process');
const os = require('node:os');

const extraArgs = process.argv.slice(2);
const expoCliPath = require.resolve('@expo/cli/build/bin/cli');

function getLanIp() {
  const networks = os.networkInterfaces();
  for (const name of Object.keys(networks)) {
    for (const network of networks[name] || []) {
      if (network.family !== 'IPv4' || network.internal) {
        continue;
      }
      if (
        network.address.startsWith('192.168.') ||
        network.address.startsWith('10.') ||
        network.address.startsWith('172.')
      ) {
        return network.address;
      }
    }
  }

  for (const name of Object.keys(networks)) {
    for (const network of networks[name] || []) {
      if (network.family === 'IPv4' && !network.internal) {
        return network.address;
      }
    }
  }

  return null;
}

process.env.EXPO_NO_DEPENDENCY_VALIDATION = '1';
process.env.EXPO_NO_NEW_ARCH_COMPAT_CHECK = '1';

if (!process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
  const lanIp = getLanIp();
  if (lanIp) {
    process.env.REACT_NATIVE_PACKAGER_HOSTNAME = lanIp;
  }
}

const child = spawn(process.execPath, [expoCliPath, 'start', ...extraArgs], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error('Failed to start Expo:', error);
  process.exit(1);
});
