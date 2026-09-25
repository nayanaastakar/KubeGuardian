import { Router } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import OpenAI from 'openai'

const router = Router()

// Initialize OpenAI conditionally
let openai: OpenAI | null = null
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
} catch (e) {
  console.warn("Could not initialize OpenAI. Missing or invalid API key.")
}

// AI chat endpoint
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, context, userId } = req.body

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' })
  }

  let content = `I understand you're asking about: "${message}". Please configure OPENAI_API_KEY in the server/.env file to get a real AI response.`

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are KubeGuardian, an expert Kubernetes and DevSecOps AI assistant. Provide concise, actionable, and secure answers for Kubernetes troubleshooting, deployments, and security.' },
          { role: 'user', content: message }
        ],
        model: 'gpt-3.5-turbo',
      })
      content = completion.choices[0].message.content || content
    } catch (error) {
      console.error('OpenAI Error:', error)
      content = `Error communicating with OpenAI: ${(error as any).message}`
    }
  }

  const response = {
    id: Math.random().toString(36).substr(2, 9),
    role: 'assistant',
    content: content,
    timestamp: new Date().toISOString(),
    confidence: 0.85,
    userId: userId || 'anonymous'
  }

  res.json({ success: true, data: response })
}))

// Analyze logs
router.post('/analyze-logs', asyncHandler(async (req, res) => {
  const { logs, type, clusterId } = req.body

  if (!logs) {
    return res.status(400).json({ success: false, error: 'Logs are required' })
  }

  let summary = 'Error logs show database connection issues and high memory usage (Mock)'
  let rootCause = 'Database connection pool exhaustion and memory leak in pod xyz-123 (Mock)'
  let recommendations = ['Increase database connection pool size from 10 to 20', 'Add connection timeout configuration of 30 seconds']

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a DevSecOps AI. Analyze these Kubernetes logs. Respond with a JSON object containing strictly: { "summary": "brief summary", "rootCause": "likely root cause", "recommendations": ["rec1", "rec2"] }.' },
          { role: 'user', content: logs }
        ],
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' }
      })
      
      const parsed = JSON.parse(completion.choices[0].message.content || '{}')
      summary = parsed.summary || summary
      rootCause = parsed.rootCause || rootCause
      recommendations = parsed.recommendations || recommendations
    } catch (error) {
      console.error('OpenAI Analysis Error:', error)
    }
  }

  const analysis = {
    summary,
    rootCause,
    recommendations,
    confidence: 0.92,
    analyzedAt: new Date().toISOString(),
    clusterId,
    logType: type || 'application',
    severity: 'high'
  }

  res.json({ success: true, data: analysis })
}))

// Get AI insights
router.get('/insights', asyncHandler(async (req, res) => {
  const { clusterId, timeRange = '24h' } = req.query

  const insights = {
    clusterId,
    timeRange,
    anomalies: [
      { type: 'spike', metric: 'cpu_usage', description: 'Unusual CPU spike detected in web-server pods', severity: 'medium', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
    ],
    recommendations: [
      { category: 'performance', title: 'Optimize database queries', description: 'Several slow queries detected that could be optimized', priority: 'high' }
    ],
    generatedAt: new Date().toISOString()
  }

  res.json({ success: true, data: insights })
}))

// Security analysis
router.post('/security-analysis', asyncHandler(async (req, res) => {
  const { clusterId, scanResults } = req.body

  if (!clusterId) {
    return res.status(400).json({ success: false, error: 'Cluster ID is required' })
  }

  const analysis = {
    clusterId,
    riskScore: Math.floor(Math.random() * 100),
    criticalIssues: scanResults?.critical || 2,
    highIssues: scanResults?.high || 8,
    mediumIssues: scanResults?.medium || 15,
    lowIssues: scanResults?.low || 23,
    recommendations: [
      'Update nginx to latest version to fix CVE-2023-1234',
      'Implement network policies to restrict pod communication'
    ],
    analyzedAt: new Date().toISOString()
  }

  res.json({ success: true, data: analysis })
}))

export default router
