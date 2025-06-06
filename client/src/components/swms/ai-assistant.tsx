import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, User, AlertCircle, Key, Lightbulb } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AiAssistantProps {
  tradeType?: string;
  activities?: string[];
  currentStep?: number;
}

export default function AiAssistant({ tradeType, activities, currentStep }: AiAssistantProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm your AI safety assistant. I can help you create comprehensive SWMS documentation by providing safety recommendations, identifying hazards, and ensuring compliance with Australian standards.${tradeType ? ` I see you're working on ${tradeType} trade work.` : ''}`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const aiChatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai/safety-content", {
        query,
        context: {
          tradeType,
          activities: activities || [],
          currentStep,
          contextDescription: `SWMS building for ${tradeType} trade. Current activities: ${activities?.join(', ') || 'None selected'}. User is on step ${currentStep} of SWMS creation.`
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: data.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error: any) => {
      toast({
        title: "AI Assistant Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    aiChatMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What safety measures are required for electrical work?",
    "Help me identify hazards for this trade",
    "What Australian standards apply to my work?",
    "Generate risk assessment for working at heights"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5 text-purple-600" />
            AI Safety Assistant
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-500">Online</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'ai' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-primary/100 text-primary'
                }`}>
                  {message.type === 'ai' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className={`flex-1 p-3 rounded-lg text-sm ${
                  message.type === 'ai'
                    ? 'bg-gray-50 text-gray-700'
                    : 'bg-primary text-white'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'ai' ? 'text-gray-500' : 'text-primary/100'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {aiChatMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 flex items-center">
              <Lightbulb className="mr-1 h-3 w-3" />
              Suggested questions:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.slice(0, 2).map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-2 text-left justify-start whitespace-normal"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about safety requirements..."
            className="flex-1"
            disabled={aiChatMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || aiChatMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* API Key Notice */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <Key className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm text-gray-700">
              AI features require OpenAI API key configuration
            </span>
          </div>
        </div>

        {/* Context Info */}
        {(tradeType || activities?.length) && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Current context:</p>
            <div className="flex flex-wrap gap-1">
              {tradeType && (
                <Badge variant="outline" className="text-xs">
                  {tradeType}
                </Badge>
              )}
              {activities?.slice(0, 2).map((activity, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {activity}
                </Badge>
              ))}
              {activities && activities.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{activities.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
