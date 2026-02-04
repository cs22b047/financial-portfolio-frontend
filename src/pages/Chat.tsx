import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Search,
  RotateCcw,
  Mic,
  Paperclip,
  MessageSquare,
  Zap,
  Sparkles,
  Plus,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';

interface QueryResult {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  queries: QueryResult[];
  createdAt: Date;
  lastActive: Date;
}

const welcomeMessages = [
  "👋 Hello Deekshitha! What would you like to know today?",
  "🔍 Hi Deekshitha! Ask me anything you'd like to explore.",
  "💼 Good day Deekshitha! What can I help you discover?",
  "🚀 Hey Deekshitha! What information are you looking for?",
  "✨ Welcome back Deekshitha! What would you like to learn?",
  "📈 Hi there Deekshitha! Ready to explore some topics?",
];

export default function Chat() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [queries, setQueries] = useState<QueryResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [welcomeMessage] = useState(() => 
    welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        lastActive: new Date(session.lastActive),
        queries: session.queries.map((q: any) => ({
          ...q,
          timestamp: new Date(q.timestamp)
        }))
      }));
      setChatSessions(sessions);
    }
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  const generateChatTitle = (firstQuery: string) => {
    return firstQuery.length > 30 ? firstQuery.substring(0, 30) + '...' : firstQuery;
  };

  const createNewSession = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      queries: [],
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setQueries([]);
    setInputValue('');
    setIsSearching(false);
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setQueries(session.queries);
    }
  };

  const updateCurrentSession = (newQueries: QueryResult[]) => {
    if (!currentSessionId) return;
    
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const updatedSession = {
          ...session,
          queries: newQueries,
          lastActive: new Date(),
          title: newQueries.length > 0 && session.title === 'New Chat' 
            ? generateChatTitle(newQueries[0].query)
            : session.title
        };
        return updatedSession;
      }
      return session;
    }));
  };

  const deleteChatSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setQueries([]);
    }
  };

  const scrollToBottom = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [queries]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Create new session if none exists
    if (!currentSessionId) {
      createNewSession();
    }

    const newQuery: QueryResult = {
      id: Date.now().toString(),
      query: query.trim(),
      response: '',
      timestamp: new Date(),
    };

    const updatedQueries = [...queries, newQuery];
    setQueries(updatedQueries);
    setInputValue('');
    setIsSearching(true);

    // Update the current session
    setTimeout(() => updateCurrentSession(updatedQueries), 100);

    // Simulate search response
    setTimeout(() => {
      const responses = [
        `Here's what I found about "${query.trim()}", Deekshitha:\n\nBased on my analysis, this topic involves several key aspects that might interest you. I've gathered comprehensive information to help answer your question thoroughly.\n\nKey insights:\n• Relevant data points and analysis\n• Current trends and patterns\n• Practical recommendations\n• Additional resources for deeper exploration\n\nWould you like me to elaborate on any specific aspect?`,
        
        `Great question about "${query.trim()}", Deekshitha!\n\nI've searched through available information and found some valuable insights:\n\n📊 Data Analysis:\nThe current information suggests several important factors to consider.\n\n🔍 Key Findings:\n• Primary considerations and implications\n• Related trends and developments\n• Potential opportunities or challenges\n\n💡 Recommendations:\nBased on this analysis, here are some actionable next steps you might consider.\n\nIs there a particular angle you'd like me to focus on?`,
        
        `Excellent query, Deekshitha! Let me break down what I discovered about "${query.trim()}":\n\n🎯 Overview:\nThis is a multifaceted topic with several important dimensions.\n\n📈 Current Status:\nThe latest information indicates specific trends and developments.\n\n🔧 Practical Applications:\n• Immediate actionable insights\n• Long-term considerations\n• Best practices and recommendations\n\n🚀 Next Steps:\nHere are some suggested areas for further exploration.\n\nWould you like me to dive deeper into any of these areas?`,
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const finalQueries = updatedQueries.map(q => 
        q.id === newQuery.id 
          ? { ...q, response }
          : q
      );
      
      setQueries(finalQueries);
      updateCurrentSession(finalQueries);
      setIsSearching(false);
    }, 2000);
  };

  const handleNewChat = () => {
    createNewSession();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch(inputValue);
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
                className="w-full bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-120px)] p-2">
              {chatSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No chat history yet
                </div>
              ) : (
                <div className="space-y-1">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadChatSession(session.id)}
                      className={cn(
                        'group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-secondary/50',
                        currentSessionId === session.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/30'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.queries.length} {session.queries.length === 1 ? 'query' : 'queries'} • {' '}
                          {session.lastActive.toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        onClick={(e) => deleteChatSession(session.id, e)}
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
          {/* Header with New Chat */}
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

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {queries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-red-600 shadow-xl mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">How can I help you today?</h2>
                  <p className="text-muted-foreground max-w-md mb-8">{welcomeMessage}</p>
                  
                  {/* Centered Search Input */}
                  <div className="w-full max-w-7xl">
                    <div className="flex items-end gap-4">
                      <div className="flex-1 relative">
                        <Textarea
                          ref={textareaRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything..."
                          className="min-h-[50px] max-h-[100px] resize-none glass-card border-border/50 focus:border-primary/50 pr-20"
                          disabled={isSearching}
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
                        onClick={() => handleSearch(inputValue)}
                        disabled={!inputValue.trim() || isSearching}
                        className="h-[50px] px-6 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 shadow-lg"
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-4xl mx-auto">
                {queries.map((item) => (
                  <div key={item.id} className="space-y-4">
                    {/* User Query */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-sm">
                        <p className="text-sm font-medium">{item.query}</p>
                        <p className="text-xs opacity-80 mt-1">
                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-red-600 shadow-lg flex-shrink-0 mt-1">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                          <div className="glass-card border border-border/50 rounded-2xl px-4 py-3 shadow-sm flex-1">
                            {item.response ? (
                              <div className="prose prose-sm max-w-none">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                  {item.response}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs text-muted-foreground">Searching for information...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={resultsEndRef} />
              </div>
            )}
          </div>

          {/* Search Input - Only show when there are queries */}
          {queries.length > 0 && (
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
                        placeholder="Ask me anything..."
                        className="min-h-[50px] max-h-[100px] resize-none glass-card border-border/50 focus:border-primary/50 pr-20"
                        disabled={isSearching}
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
                      onClick={() => handleSearch(inputValue)}
                      disabled={!inputValue.trim() || isSearching}
                      className="h-[50px] px-6 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 shadow-lg"
                    >
                      <Search className="h-5 w-5" />
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