import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Mic,
  Paperclip,
  Settings,
  MessageSquare,
  Zap,
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const welcomeMessages = [
  "👋 Hello Deekshitha! What's the agenda today?",
  "🌟 Hi Deekshitha! How can I help you today?",
  "💼 Good day Deekshitha! What would you like to explore?",
  "🚀 Hey Deekshitha! What's on your mind today?",
  "✨ Welcome back Deekshitha! What can I assist you with?",
  "📈 Hi there Deekshitha! Ready to dive into something new?",
  "🎯 Hello Deekshitha! What brings you here today?",
  "💡 Hey Deekshitha! What would you like to discuss?",
  "🌈 Hi Deekshitha! How can I make your day better?",
  "⚡ Welcome Deekshitha! What's your focus today?",
];

const conversationStarters = [
  "Start a Conversation",
  "Let's Chat",
  "Begin Our Discussion",
  "Start Talking",
  "Let's Get Started",
  "Ready to Chat?",
  "What's on Your Mind?",
  "Let's Connect",
];

const conversationSubtitles = [
  "Ask me anything you'd like to know or discuss",
  "I'm here to help with whatever you need",
  "Share your thoughts and let's explore together",
  "What would you like to talk about today?",
  "I'm ready to assist you with anything",
  "Tell me what's important to you right now",
  "Let's have a meaningful conversation",
  "What can we discover together today?",
];

export default function Chat() {
  // Generate random messages each time the component mounts
  const [currentWelcome] = useState(() => 
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  );
  const [currentStarter] = useState(() => 
    conversationStarters[Math.floor(Math.random() * conversationStarters.length)]
  );
  const [currentSubtitle] = useState(() => 
    conversationSubtitles[Math.floor(Math.random() * conversationSubtitles.length)]
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: currentWelcome,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question, Deekshitha! Let me think about that for you. Based on what I understand, I'd suggest focusing on your key priorities first.",
        "Interesting point, Deekshitha! I can help you explore that further. What specific aspect would you like to dive deeper into?",
        "Thanks for sharing that with me, Deekshitha! Here's what I think might be helpful for your situation.",
        "I understand what you're looking for, Deekshitha. Let me provide you with some insights that might be useful.",
        "Great question, Deekshitha! I'd be happy to help you work through this. Here are some thoughts to consider.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-2rem)] max-w-7xl mx-auto">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-background animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Conversational Agent</h1>
                  <p className="text-sm text-muted-foreground">Powered by advanced financial AI</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass-card">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="glass-card">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 1 && (
              <div className="text-center py-12">
                <div className="mb-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-chart-2 shadow-xl mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{currentStarter}</h2>
                  <p className="text-muted-foreground">{currentSubtitle}</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4 max-w-4xl',
                  message.type === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg flex-shrink-0',
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-chart-3 to-chart-4'
                    : 'bg-gradient-to-br from-primary to-chart-2'
                )}>
                  {message.type === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className={cn(
                  'flex-1 space-y-2',
                  message.type === 'user' ? 'text-right' : 'text-left'
                )}>
                  <div className={cn(
                    'inline-block max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'glass-card border border-border/50'
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.type === 'assistant' && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-secondary">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-secondary">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-secondary">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 max-w-4xl mr-auto">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="glass-card border border-border/50 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-end gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your portfolio, market trends, investment strategies..."
                  className="min-h-[60px] max-h-[120px] resize-none glass-card border-border/50 focus:border-primary/50 pr-20"
                  disabled={isTyping}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="h-[60px] px-6 bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 shadow-lg"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Powered by AI</span>
              </div>
              <span>•</span>
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}