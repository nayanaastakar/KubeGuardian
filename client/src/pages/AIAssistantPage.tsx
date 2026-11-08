import { useState, type FormEvent } from 'react'
import { MessageCircle, Sparkles, Terminal, FileText, Send, RefreshCw, Copy, Check } from 'lucide-react'
import { chatWithAI, analyzeLogsWithAI } from '../services/api'
import { useNotificationsStore } from '../store/notificationsStore'

export function AIAssistantPage() {
  const addNotification = useNotificationsStore((state) => state.addNotification)
  const [activeTab, setActiveTab] = useState<'chat' | 'logAnalysis'>('chat')
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: `Welcome to the KubeGuardian AI DevSecOps Assistant!

I am actively monitoring your cluster. You can ask me about:
- Pod crash loops, OOMKilled errors (Exit code 137), and restart diagnostics
- RBAC privilege escalation detection and least-privilege role policies
- Kubernetes NetworkPolicy generation and namespace microsegmentation
- Fixing CVEs and container image security hardening`,
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  // Log Analysis state
  const [rawLogs, setRawLogs] = useState(`2026-11-06T00:14:22.451Z [payment-service] ERROR: java.lang.OutOfMemoryError: Java heap space
2026-11-06T00:14:22.455Z [payment-service] FATAL: JVM exiting with code 137
2026-11-06T00:14:23.001Z kubelet: Container payment-service failed liveness probe, restarting`)
  const [logAnalysis, setLogAnalysis] = useState<any | null>(null)
  const [analyzingLogs, setAnalyzingLogs] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const quickPrompts = [
    'My payment-service pod is in CrashLoopBackOff with exit code 137. What does this mean and how do I fix it?',
    'How do I create a default-deny NetworkPolicy for the frontend namespace?',
    'Explain the security risk of binding default ServiceAccount to cluster-admin.',
    'Generate a hardened Kubernetes deployment spec with runAsNonRoot and resource limits.'
  ]

  const handleSubmitChat = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg])
    const promptToSend = input
    setInput('')
    setLoading(true)

    try {
      const res = await chatWithAI(promptToSend)
      const assistantMsg = {
        role: 'assistant',
        content: res.data?.data?.content || 'AI service response unavailable.',
        suggestedCommands: res.data?.data?.suggestedCommands,
        remediationYaml: res.data?.data?.remediationYaml,
        modelUsed: res.data?.data?.modelUsed,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to connect to AI engine: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeLogs = async () => {
    if (!rawLogs.trim() || analyzingLogs) return
    setAnalyzingLogs(true)
    try {
      const res = await analyzeLogsWithAI(rawLogs, 'application')
      setLogAnalysis(res.data?.data)
      addNotification({
        type: 'success',
        title: 'Log Analysis Completed',
        message: 'Root cause and remediation generated.'
      })
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: err.message
      })
    } finally {
      setAnalyzingLogs(false)
    }
  }

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">AI DevSecOps Engine</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Intelligent Troubleshooting & Log RCA</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-1.5" /> DevSecOps Chat
            </button>
            <button
              onClick={() => setActiveTab('logAnalysis')}
              className={`rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'logAnalysis'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-1.5" /> Log Root-Cause Analysis
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'chat' ? (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Main Chat Feed */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel lg:col-span-8 space-y-4">
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-3xl p-5 ${
                    msg.role === 'assistant'
                      ? 'bg-slate-950/90 border border-slate-800 text-slate-200'
                      : 'bg-cyan-950/40 border border-cyan-800/50 text-white ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400">
                      {msg.role === 'assistant' ? '🛡️ KubeGuardian AI' : '👤 Operator'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="whitespace-pre-line text-sm leading-relaxed space-y-2">
                    {msg.content}
                  </div>

                  {msg.suggestedCommands && msg.suggestedCommands.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                      <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Suggested kubectl Commands</p>
                      {msg.suggestedCommands.map((cmd: string, cIdx: number) => (
                        <div key={cIdx} className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 font-mono text-xs text-cyan-300 border border-slate-800">
                          <code>{cmd}</code>
                          <button
                            onClick={() => copyToClipboard(cmd, index * 100 + cIdx)}
                            className="text-slate-400 hover:text-white ml-2"
                          >
                            {copiedIndex === (index * 100 + cIdx) ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.remediationYaml && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">Remediation YAML Patch</p>
                      <pre className="rounded-2xl bg-slate-900 p-3 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
                        {msg.remediationYaml}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitChat} className="space-y-3 pt-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitChat()
                  }
                }}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                placeholder="Ask about pod failures, exit code 137, RBAC permissions, or NetworkPolicies..."
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Analyzing Query...' : 'Send to AI Assistant'}
              </button>
            </form>
          </div>

          {/* Quick Prompts Panel */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h3>Common DevSecOps Scenarios</h3>
            </div>
            <p className="text-xs text-slate-400">Click any scenario to ask the AI diagnostic engine:</p>
            <div className="space-y-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { setInput(p) }}
                  className="w-full text-left rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-900 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Log Analysis Tab */
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel lg:col-span-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Paste Kubernetes / Pod Logs</h2>
            <p className="text-sm text-slate-400">Feed container stdout/stderr or termination dumps for automated root-cause extraction.</p>
            <textarea
              value={rawLogs}
              onChange={(e) => setRawLogs(e.target.value)}
              rows={12}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300 focus:border-cyan-500 outline-none"
            />
            <button
              onClick={handleAnalyzeLogs}
              disabled={analyzingLogs || !rawLogs.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {analyzingLogs ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {analyzingLogs ? 'Extracting Root Cause...' : 'Run AI Log RCA'}
            </button>
          </div>

          <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel lg:col-span-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Root Cause Analysis (RCA)</h2>
            {logAnalysis ? (
              <div className="space-y-4 text-sm">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold">Incident Summary</span>
                  <p className="mt-1 font-medium text-white">{logAnalysis.summary}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Identified Root Cause</span>
                  <p className="mt-1 text-slate-300">{logAnalysis.rootCause}</p>
                  {logAnalysis.detectedExitCode && (
                    <span className="inline-block mt-2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-0.5 text-xs font-mono font-semibold">
                      Exit Code: {logAnalysis.detectedExitCode} (OOMKilled)
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">AI Recommendations</span>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    {logAnalysis.recommendations?.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {logAnalysis.suggestedPatchYaml && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">Generated Kubernetes Patch</span>
                    <pre className="mt-2 rounded-2xl bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800">
                      {logAnalysis.suggestedPatchYaml}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Click "Run AI Log RCA" to perform automated log analysis.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
