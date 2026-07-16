import { useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Sparkles, Terminal } from 'lucide-react'
import { chatWithAI } from '../services/api'
import { aiMessages, commandExamples } from '../services/mockApi'

export function AIAssistantPage() {
  const [messages, setMessages] = useState(aiMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const canSend = input.trim().length > 0

  const reply = useMemo(() => {
    return messages.filter((message) => message.role === 'assistant')
  }, [messages])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSend) return

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date().toISOString()
    }
    setMessages((current) => [...current, userMessage as any])
    setInput('')
    setLoading(true)

    try {
      const response = await chatWithAI(input)
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.data?.data?.content || 'AI service could not produce a response.',
        timestamp: new Date().toISOString()
      }
      setMessages((current) => [...current, assistantMessage])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: 'assistant' as const, content: 'Unable to connect to AI service. Please check the backend.', timestamp: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">AI Assistant</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Kubernetes troubleshooting chat</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <Sparkles className="h-5 w-5 text-cyan-400" /> Natural language commands
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-5 flex items-center gap-3 text-slate-200">
            <MessageCircle className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold">Ask the AI</h2>
          </div>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'assistant' ? 'rounded-3xl bg-slate-950/80 p-4 text-slate-200' : 'rounded-3xl bg-slate-900/90 p-4 text-slate-100'}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{message.role}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6">{message.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={4}
              className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
              placeholder="Ask the AI assistant about pod failures, YAML fixes, or deployment risk analysis..."
            />
            <button
              type="submit"
              disabled={!canSend || loading}
              className="btn-primary w-full"
            >
              {loading ? 'Analyzing...' : 'Submit query'}
            </button>
          </form>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 shadow-panel">
          <div className="mb-5 flex items-center gap-3 text-slate-200">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-semibold">Natural language commands</h2>
          </div>
          <div className="space-y-4">
            {commandExamples.map((example) => (
              <div key={example.intent} className="rounded-3xl bg-slate-950/80 p-4 text-slate-300">
                <p className="text-sm text-slate-400">"{example.intent}"</p>
                <p className="mt-2 font-medium text-white">{example.command}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
