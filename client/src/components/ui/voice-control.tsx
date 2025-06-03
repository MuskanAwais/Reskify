import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface VoiceControlProps {
  onTranscript: (text: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
}

export default function VoiceControl({ 
  onTranscript, 
  language = 'en', 
  placeholder = "Click to start voice input",
  className = ""
}: VoiceControlProps) {
  const { t } = useTranslation(language);
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getLanguageCode(language);
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          onTranscript(finalTranscript);
          setTranscript("");
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          setHasPermission(false);
          toast({
            title: t('voice.permission-denied'),
            description: "Please enable microphone access in your browser settings",
            variant: "destructive"
          });
        } else {
          toast({
            title: t('common.error'),
            description: `Voice recognition error: ${event.error}`,
            variant: "destructive"
          });
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, [language, onTranscript, t, toast]);

  const getLanguageCode = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'zh': 'zh-CN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN'
    };
    return languageMap[lang] || 'en-US';
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      toast({
        title: t('voice.permission-denied'),
        description: "Please enable microphone access to use voice input",
        variant: "destructive"
      });
      return false;
    }
  };

  const startListening = async () => {
    if (!isSupported) {
      toast({
        title: t('voice.not-supported'),
        description: "Please use a modern browser with speech recognition support",
        variant: "destructive"
      });
      return;
    }

    if (hasPermission === null) {
      const permitted = await requestMicrophonePermission();
      if (!permitted) return;
    }

    if (hasPermission === false) {
      await requestMicrophonePermission();
      return;
    }

    try {
      recognitionRef.current.lang = getLanguageCode(language);
      recognitionRef.current.start();
      toast({
        title: t('voice.listening'),
        description: "Speak now...",
      });
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      toast({
        title: t('common.error'),
        description: "Failed to start voice recognition",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      toast({
        title: t('voice.stopped'),
        description: "Voice input stopped",
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        className="flex items-center gap-2 min-w-[120px]"
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" />
            <span className="hidden sm:inline">{t('voice.listening')}</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">{t('btn.voice-input')}</span>
          </>
        )}
      </Button>
      
      {hasPermission === false && (
        <Badge variant="destructive" className="text-xs">
          <Volume2 className="w-3 h-3 mr-1" />
          {t('voice.permission-required')}
        </Badge>
      )}
      
      {transcript && (
        <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
          {transcript}
        </Badge>
      )}
      
      {isListening && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-500 hidden sm:inline">Recording</span>
        </div>
      )}
    </div>
  );
}