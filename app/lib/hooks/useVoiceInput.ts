import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface VoiceInputOptions {
  onTranscript: (text: string) => void;
  language?: string;
}

export function useVoiceInput({ onTranscript, language = 'en-US' }: VoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
          onTranscript(transcriptRef.current);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error !== 'aborted') {
          toast.error(`Voice input error: ${event.error}`);
        }
        
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (isRecording) {
          // Unexpected stop, try to restart
          try {
            recognition.start();
          } catch (error) {
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [language, isRecording, onTranscript]);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!recognitionRef.current) {
      toast.error('Voice input is not available.');
      return;
    }

    try {
      transcriptRef.current = '';
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start voice input. Please try again.');
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
        
        // Final transcript
        if (transcriptRef.current.trim()) {
          onTranscript(transcriptRef.current.trim());
        }
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    }
  }, [onTranscript]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isSupported,
    toggleRecording,
    startRecording,
    stopRecording,
  };
}




