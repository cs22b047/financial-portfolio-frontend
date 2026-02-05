import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import {
  Search,
  Mic,
  Paperclip,
  MessageSquare,
  Sparkles,
  Plus,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  queryType?: string;
  sqlQuery?: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  createdDate: string;
}

interface Conversation {
  sessionId: string;
  userId: string;
  title: string;
  status: string;
  messageCount: number;
  createdDate: string;
  lastMessageAt: string;
  messages?: Message[];
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5500';

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/chatbot/conversations?userId=default_user`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/chatbot/conversations?userId=default_user`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(data.sessionId);
        setMessages([]);
        await loadConversations();
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create new conversation');
    }
  };

  const loadConversation = async (sessionId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/chatbot/conversations/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(sessionId);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const deleteConversation = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${apiUrl}/api/chatbot/conversations/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadConversations();
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
        toast.success('Conversation deleted');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    let sessionId = currentSessionId;

    // Create new conversation if none exists
    if (!sessionId) {
      try {
        const response = await fetch(`${apiUrl}/api/chatbot/conversations?userId=default_user`, {
          method: 'POST',
        });
        
        if (response.ok) {
          const data = await response.json();
          sessionId = data.sessionId;
          setCurrentSessionId(sessionId);
          await loadConversations();
        } else {
          toast.error('Failed to create conversation');
          return;
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
        toast.error('Failed to create conversation');
        return;
      }
    }

    const tempMessage: Message = {
      id: Date.now(),
      role: 'USER',
      content: message.trim(),
      createdDate: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'ASSISTANT',
          content: data.response,
          queryType: data.queryType,
          sqlQuery: data.sqlQuery,
          processingTimeMs: data.processingTime,
          createdDate: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        await loadConversations(); // Refresh conversation list
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewConversation();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-2rem)] max-w-7xl mx-auto">
        {/* Chat History Sidebar */}
        {showHistory && (
          <div className="w-64 border-r border-border/30 bg-card/50 backdrop-blur-sm">
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Chat History
                </h3>
                <Button
                  onClick={() => setShowHistory(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-primary to-gray-800 hover:from-primary/90 hover:to-gray-800/90"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-120px)] p-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No chat history yet
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.sessionId}
                      onClick={() => loadConversation(conversation.sessionId)}
                      className={cn(
                        'group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-secondary/50',
                        currentSessionId === conversation.sessionId ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/30'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {conversation.title || 'New Chat'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'} • {' '}
                          {formatDate(conversation.lastMessageAt || conversation.createdDate)}
                        </div>
                      </div>
                      <Button
                        onClick={(e) => deleteConversation(conversation.sessionId, e)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              {!showHistory && (
                <Button
                  onClick={() => setShowHistory(true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-gray-800">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Portfolio Assistant</h2>
                  <p className="text-xs text-muted-foreground">AI-powered financial assistant</p>
                </div>
              </div>
            </div>
            {!showHistory && (
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="glass-card hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-gray-800 shadow-xl mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">How can I help you today?</h2>
                  <p className="text-muted-foreground max-w-md mb-8">
                    Ask me about your portfolio, market data, transactions, or any financial insights you need!
                  </p>
                  
                  {/* Centered Search Input */}
                  <div className="w-full max-w-7xl">
                    <div className="flex items-end gap-4">
                      <div className="flex-1 relative">
                        <Textarea
                          ref={textareaRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your portfolio..."
                          className="min-h-[50px] max-h-[100px] resize-none glass-card border-border/50 focus:border-primary/50 pr-20"
                          disabled={isLoading}
                        />
                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim() || isLoading}
                        className="h-[50px] px-6 bg-gradient-to-r from-primary to-gray-800 hover:from-primary/90 hover:to-gray-800/90 shadow-lg"
                      >
                        {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-4">
                    {message.role === 'USER' ? (
                      /* User Message */
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-sm">
                          <p className="text-sm font-medium">{message.content}</p>
                          <p className="text-xs opacity-80 mt-1">
                            {formatTime(message.createdDate)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* AI Response */
                      <div className="flex justify-start">
                        <div className="max-w-[85%]">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-gray-800 shadow-lg flex-shrink-0 mt-1">
                              <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <div className="glass-card border border-border/50 rounded-2xl px-4 py-3 shadow-sm flex-1">
                              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:m-0 prose-p:leading-relaxed prose-headings:m-1 prose-headings:font-semibold prose-ul:m-1 prose-ol:m-1 prose-li:m-0 prose-li:p-0 prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-secondary prose-pre:p-3 prose-pre:overflow-auto prose-a:text-primary prose-a:underline prose-strong:font-semibold">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="text-sm text-foreground mb-2">{children}</p>,
                                    h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-2 mt-3">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-bold text-foreground mb-2 mt-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-bold text-foreground mb-1 mt-2">{children}</h3>,
                                    ul: ({ children }) => <ul className="list-disc list-inside text-sm text-foreground mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-foreground mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-sm text-foreground">{children}</li>,
                                    code: ({ children }) => <code className="bg-secondary/60 px-2 py-1 rounded text-xs font-mono text-foreground">{children}</code>,
                                    pre: ({ children }) => <pre className="bg-secondary/60 p-3 rounded-lg overflow-auto mb-2 text-xs">{children}</pre>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 py-2 text-sm italic text-muted-foreground mb-2">{children}</blockquote>,
                                    a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{children}</a>,
                                    table: ({ children }) => (
                                      <div className="overflow-x-auto mb-4 rounded-lg border border-border/50 bg-secondary/20">
                                        <table className="w-full border-collapse text-sm">{children}</table>
                                      </div>
                                    ),
                                    thead: ({ children }) => <thead className="bg-primary/20 border-b-2 border-primary/40">{children}</thead>,
                                    tbody: ({ children }) => <tbody className="divide-y divide-border/30">{children}</tbody>,
                                    tr: ({ children, isHeader }) => <tr className={isHeader ? '' : 'hover:bg-primary/5 transition-colors'}>{children}</tr>,
                                    th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-foreground first:pl-4 last:pr-4">{children}</th>,
                                    td: ({ children }) => <td className="px-3 py-2 text-foreground first:pl-4 last:pr-4">{children}</td>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                              {message.queryType && (
                                <div className="mt-2 pt-2 border-t border-border/30">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">Type:</span>
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                                      {message.queryType}
                                    </span>
                                    {message.processingTimeMs && (
                                      <>
                                        <span className="ml-2">•</span>
                                        <span>{message.processingTimeMs}ms</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-gray-800 shadow-lg flex-shrink-0 mt-1">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div className="glass-card border border-border/50 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-muted-foreground">Analyzing your request...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={resultsEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Only show when there are messages */}
          {messages.length > 0 && (
            <div className="border-t border-border/30 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex justify-center">
                <div className="w-full max-w-7xl">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 relative">
                      <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about your portfolio..."
                        className="min-h-[50px] max-h-[100px] resize-none glass-card border-border/50 focus:border-primary/50 pr-20"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => sendMessage(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      className="h-[50px] px-6 bg-gradient-to-r from-primary to-gray-800 hover:from-primary/90 hover:to-gray-800/90 shadow-lg"
                    >
                      {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
