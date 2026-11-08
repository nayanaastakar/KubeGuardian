const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DOCS_DIR = path.resolve(__dirname, '..', 'docs', 'images');

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkUrl(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 304 || res.status === 404) {
        return true;
      }
    } catch (e) {
      // not yet up
    }
    await wait(800);
  }
  return false;
}

async function run() {
  console.log('--- KubeGuardian Automated Screenshot Capture Suite (Ports 8080 & 3002) ---');

  // 1. Start Server on port 8080
  console.log('[1/4] Starting backend server on port 8080...');
  const serverProcess = spawn('node', ['scripts/start-dist.js'], {
    cwd: path.resolve(__dirname, '..', 'server'),
    env: { ...process.env, PORT: '8080', NODE_ENV: 'production' },
    stdio: 'pipe',
    shell: true,
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  // 2. Start Client preview on port 3002
  console.log('[2/4] Starting client preview on port 3002...');
  const clientProcess = spawn('npx', ['vite', 'preview', '--port', '3002', '--host'], {
    cwd: path.resolve(__dirname, '..', 'client'),
    env: { ...process.env },
    stdio: 'pipe',
    shell: true,
  });

  clientProcess.stdout.on('data', (d) => process.stdout.write(`[CLIENT] ${d}`));
  clientProcess.stderr.on('data', (d) => process.stderr.write(`[CLIENT ERR] ${d}`));

  let browser;

  try {
    console.log('[3/4] Probing server and client health...');
    await wait(3000);
    const serverReady = await checkUrl('http://localhost:8080/health', 25000);
    console.log(`Backend health ready: ${serverReady}`);

    const clientReady = await checkUrl('http://localhost:3002', 25000);
    console.log(`Client preview on port 3002 ready: ${clientReady}`);

    if (!clientReady) {
      throw new Error('Frontend client preview failed to become ready on port 3002.');
    }

    console.log('[4/4] Launching Headless Chrome via Puppeteer-Core...');
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1.5,
      },
    });

    const page = await browser.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
      }
    });

    const targets = [
      {
        path: '/overview',
        file: '01_overview_dashboard.png',
        name: 'DevSecOps Unified Command Center & Overview Dashboard',
      },
      {
        path: '/clusters',
        file: '02_cluster_monitoring.png',
        name: 'Real-Time Kubernetes Cluster & Pod Inventory Monitoring',
      },
      {
        path: '/incidents',
        file: '03_incident_center_remediation.png',
        name: 'Incident Center & Approval-Based Remediation Workflows',
      },
      {
        path: '/vulnerabilities',
        file: '04_vulnerability_management.png',
        name: 'Container Image Security & Trivy Vulnerability Management',
      },
      {
        path: '/security',
        file: '05_security_scoring_compliance.png',
        name: 'CIS Kubernetes Benchmark & RBAC Privilege Audit',
      },
      {
        path: '/ai-assistant',
        file: '06_ai_troubleshooting_assistant.png',
        name: 'AI DevSecOps Diagnostic Assistant & Log Root Cause Analysis',
      },
      {
        path: '/chaos',
        file: '07_chaos_engineering.png',
        name: 'Resilience Testing & Chaos Engineering Workbench',
      },
      {
        path: '/settings',
        file: '08_platform_settings.png',
        name: 'Platform Settings, Audit Logging & Security Integrations',
      },
    ];

    for (const target of targets) {
      const fullUrl = `http://localhost:3002${target.path}`;
      console.log(`\nNavigating to ${target.name} (${fullUrl})...`);
      await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 35000 });
      // Allow settling time for animations and data rendering
      await wait(3500);

      const filePath = path.join(DOCS_DIR, target.file);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`✓ Captured: ${target.file} (${fs.statSync(filePath).size} bytes)`);
    }

    console.log('\n--- ALL 8 MODULE SCREENSHOTS CAPTURED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Execution encountered an error:', error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    console.log('Stopping background server and client processes...');
    try {
      if (serverProcess && serverProcess.pid) {
        process.kill(serverProcess.pid);
      }
    } catch (e) {}
    try {
      if (clientProcess && clientProcess.pid) {
        process.kill(clientProcess.pid);
      }
    } catch (e) {}
  }
}

run().then(() => {
  console.log('Capture script finished.');
  process.exit(process.exitCode || 0);
});
