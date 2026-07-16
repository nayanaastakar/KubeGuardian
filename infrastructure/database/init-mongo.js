// MongoDB initialization script for KubeGuardian
// This script runs when the MongoDB container starts

// Switch to the kubeguardian database
db = db.getSiblingDB('kubeguardian');

// Create collections with initial data
print('Initializing KubeGuardian MongoDB database...');

// Create users collection with indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: 1 });

// Insert default admin user (password: admin123)
db.users.insertOne({
  email: 'admin@kubeguardian.com',
  name: 'Admin User',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create clusters collection with indexes
db.clusters.createIndex({ name: 1 }, { unique: true });
db.clusters.createIndex({ createdBy: 1 });
db.clusters.createIndex({ status: 1 });
db.clusters.createIndex({ createdAt: 1 });

// Insert sample cluster
db.clusters.insertOne({
  name: 'demo-cluster',
  endpoint: 'https://demo.k8s.example.com',
  version: 'v1.28.0',
  status: 'healthy',
  nodeCount: 3,
  namespaceCount: 5,
  podCount: 15,
  createdBy: db.users.findOne({ email: 'admin@kubeguardian.com' })._id,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create vulnerabilities collection with indexes
db.vulnerabilities.createIndex({ clusterId: 1 });
db.vulnerabilities.createIndex({ severity: 1 });
db.vulnerabilities.createIndex({ status: 1 });
db.vulnerabilities.createIndex({ discoveredAt: 1 });
db.vulnerabilities.createIndex({ cveId: 1 });

// Insert sample vulnerabilities
const demoCluster = db.clusters.findOne({ name: 'demo-cluster' });
db.vulnerabilities.insertMany([
  {
    title: 'CVE-2023-1234: Remote Code Execution in nginx',
    description: 'A critical vulnerability in nginx allows remote code execution',
    severity: 'critical',
    cvssScore: 9.8,
    cveId: 'CVE-2023-1234',
    package: 'nginx',
    version: '1.18.0',
    fixedVersion: '1.19.0',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-1234'],
    discoveredAt: new Date(),
    clusterId: demoCluster._id,
    namespace: 'default',
    pod: 'nginx-deployment',
    container: 'nginx',
    image: 'nginx:1.18.0',
    status: 'active',
    createdBy: db.users.findOne({ email: 'admin@kubeguardian.com' })._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'CVE-2023-5678: Information Disclosure in Redis',
    description: 'Redis information disclosure vulnerability',
    severity: 'high',
    cvssScore: 7.5,
    cveId: 'CVE-2023-5678',
    package: 'redis',
    version: '6.0.0',
    fixedVersion: '6.2.0',
    references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-5678'],
    discoveredAt: new Date(),
    clusterId: demoCluster._id,
    namespace: 'cache',
    pod: 'redis-master',
    container: 'redis',
    image: 'redis:6.0.0',
    status: 'active',
    createdBy: db.users.findOne({ email: 'admin@kubeguardian.com' })._id,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create alerts collection with indexes
db.alerts.createIndex({ clusterId: 1 });
db.alerts.createIndex({ severity: 1 });
db.alerts.createIndex({ status: 1 });
db.alerts.createIndex({ createdAt: 1 });
db.alerts.createIndex({ source: 1 });

// Insert sample alerts
db.alerts.insertMany([
  {
    title: 'High CPU usage on web-server pod',
    description: 'CPU usage exceeded 90% threshold for 5 minutes',
    severity: 'high',
    status: 'active',
    clusterId: demoCluster._id,
    namespace: 'default',
    source: 'prometheus',
    labels: {
      pod: 'web-server-xyz',
      namespace: 'default',
      alertname: 'HighCPUUsage'
    },
    createdAt: new Date(),
    createdBy: db.users.findOne({ email: 'admin@kubeguardian.com' })._id
  },
  {
    title: 'Memory pressure on database pod',
    description: 'Memory usage is at 85% capacity',
    severity: 'medium',
    status: 'acknowledged',
    clusterId: demoCluster._id,
    namespace: 'database',
    source: 'prometheus',
    labels: {
      pod: 'postgres-primary',
      namespace: 'database',
      alertname: 'MemoryPressure'
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    acknowledgedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    createdBy: db.users.findOne({ email: 'admin@kubeguardian.com' })._id
  }
]);

// Create indexes for better query performance
db.users.createIndex({ email: 1, role: 1 });
db.clusters.createIndex({ status: 1, createdAt: -1 });
db.vulnerabilities.createIndex({ severity: 1, discoveredAt: -1 });
db.alerts.createIndex({ severity: 1, status: 1, createdAt: -1 });

print('MongoDB initialization completed successfully!');
print('Database: kubeguardian');
print('Collections created: users, clusters, vulnerabilities, alerts');
print('Default admin user: admin@kubeguardian.com');
print('Sample data inserted for demonstration purposes.');
