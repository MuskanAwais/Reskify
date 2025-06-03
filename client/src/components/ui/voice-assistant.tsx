import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface VoiceAssistantProps {
  onVoiceCommand?: (command: string) => void;
  language?: string;
}

export default function VoiceAssistant({ onVoiceCommand, language = "en-US" }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognition = useRef<SpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = true;
      recognition.current.lang = language;

      recognition.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          onVoiceCommand?.(transcript);
          processVoiceCommand(transcript);
        }
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle permission denied gracefully
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsSupported(false);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice commands.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Voice Recognition Error",
            description: "Could not process voice input. Please try again.",
            variant: "destructive",
          });
        }
      };
    }

    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, [language, onVoiceCommand, toast]);

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Voice command responses based on language
    const responses = {
      'en-US': {
        newSwms: "Creating a new SWMS document for you.",
        dashboard: "Taking you to the dashboard.",
        help: "I can help you create SWMS documents, navigate the app, or answer safety questions. Try saying 'create new SWMS' or 'go to dashboard'.",
        unknown: "I didn't understand that command. Try saying 'help' for available commands."
      },
      'es-ES': {
        newSwms: "Creando un nuevo documento SWMS para ti.",
        dashboard: "Llevándote al panel de control.",
        help: "Puedo ayudarte a crear documentos SWMS, navegar por la aplicación o responder preguntas de seguridad.",
        unknown: "No entendí ese comando. Intenta decir 'ayuda' para comandos disponibles."
      },
      'zh-CN': {
        newSwms: "为您创建新的SWMS文档。",
        dashboard: "带您到仪表板。",
        help: "我可以帮助您创建SWMS文档、导航应用程序或回答安全问题。",
        unknown: "我不理解该命令。请说'帮助'获取可用命令。"
      }
    };

    const langResponses = responses[language as keyof typeof responses] || responses['en-US'];

    if (lowerCommand.includes('new') && lowerCommand.includes('swms')) {
      speak(langResponses.newSwms);
      window.location.href = '/swms-builder';
    } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
      speak(langResponses.dashboard);
      window.location.href = '/dashboard';
    } else if (lowerCommand.includes('help') || lowerCommand.includes('ayuda') || lowerCommand.includes('帮助')) {
      speak(langResponses.help);
    } else {
      speak(langResponses.unknown);
    }
  };

  const speak = (text: string) => {
    if (synthesis.current && 'speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.onend = () => setIsSpeaking(false);
      synthesis.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition.current) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
      setTranscript("");
    }
  };

  const stopSpeaking = () => {
    if (synthesis.current) {
      synthesis.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleListening}
        className={`relative ${isListening ? 'bg-red-50 text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
        title={isListening ? "Stop listening" : "Start voice assistant"}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {isListening && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-3 w-3 p-0 rounded-full">
            <span className="sr-only">Recording</span>
          </Badge>
        )}
      </Button>

      {isSpeaking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={stopSpeaking}
          className="text-blue-600 hover:text-blue-700"
          title="Stop speaking"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}

      {!isSpeaking && (transcript || isListening) && (
        <div className="text-xs text-muted-foreground max-w-32 truncate">
          {isListening ? "Listening..." : transcript}
        </div>
      )}
    </div>
  );
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}