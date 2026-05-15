'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, User, Sparkles, Code, Terminal, AlertTriangle, Shield, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AIAssistantPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm KubeGuardian AI, your specialized DevSecOps Engineering Assistant. I can help you analyze logs, explain vulnerabilities, write secure Kubernetes manifests, or troubleshoot complex deployment failures. How can I assist you today?" }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    
    const userMessage = input.trim()
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    
    // Add user message
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.data.content 
        }])
      } else {
        toast.error('AI assistant is currently unavailable')
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment." 
        }])
      }
    } catch (error) {
      console.error('AI Request failed', error)
      toast.error('Connection error')
    } finally {
      setIsTyping(false)
    }
  }

  const suggestions = [
    { text: "Fix CrashLoopBackOff", icon: <Terminal className="w-3 h-3 mr-1" /> },
    { text: "Security fix for CVE-2023-44487", icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
    { text: "Hardened RBAC Policy", icon: <Shield className="w-3 h-3 mr-1" /> },
    { text: "Optimize CI/CD pipeline", icon: <Code className="w-3 h-3 mr-1" /> }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="h-8 w-8 text-purple-500" />
            AI DevSecOps Engineer
          </h1>
          <p className="text-muted-foreground mt-2">Your intelligent co-pilot for high-level Kubernetes security and operations.</p>
        </div>

        <Card className="glass-effect shadow-lg border-0 flex-1 flex flex-col overflow-hidden bg-white/40 dark:bg-gray-900/40">
          <CardHeader className="bg-white/60 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> KubeGuardian LLM Engine
                </CardTitle>
                <CardDescription>Providing engineering-grade solutions based on your cluster state</CardDescription>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 animate-pulse">Live Analysis</Badge>
            </div>
          </CardHeader>
          
          <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 rounded-tl-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1 shadow-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-4 bg-white/60 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((sug, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(sug.text)}
                  className="flex items-center text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  {sug.icon} {sug.text}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Ask your AI DevSecOps Engineer about cluster fixes, security, or pipelines..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-purple-500 shadow-sm"
              />
              <Button 
                onClick={handleSend} 
                disabled={isTyping}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all active:scale-95"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
