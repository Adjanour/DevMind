"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Trash2,
  Save,
  Loader2,
  Volume2,
  Wand2,
} from "lucide-react";
import { useSpeechSynthesis } from "react-speech-kit";
import { cn } from "~/lib/utils";

interface VoiceNotesProps {
  onTranscriptionComplete: (text: string, title?: string) => void;
  className?: string;
}

export function VoiceNotes({ onTranscriptionComplete, className }: VoiceNotesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { speak, cancel, speaking } = useSpeechSynthesis();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convert audio blob to base64 for API transmission
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('action', 'transcribe');

      const response = await fetch('/api/ai', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      setTranscription(result.transcription);
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Failed to transcribe audio. Please try again.');
      
      // Fallback to Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        fallbackTranscription();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackTranscription = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscription(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
    };

    recognition.start();
  };

  const enhanceTranscription = async () => {
    if (!transcription) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'improve',
          content: transcription,
        }),
      });

      const result = await response.json();
      setTranscription(result.result);
    } catch (error) {
      console.error('Enhancement error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAsNote = async () => {
    if (!transcription) return;

    try {
      // Generate a title for the note
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggest_title',
          content: transcription,
        }),
      });

      const result = await response.json();
      onTranscriptionComplete(transcription, result.title);
      
      // Reset component
      reset();
    } catch (error) {
      console.error('Save error:', error);
      onTranscriptionComplete(transcription);
      reset();
    }
  };

  const reset = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setTranscription("");
    setIsPlaying(false);
    setRecordingTime(0);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speakTranscription = () => {
    if (speaking) {
      cancel();
    } else if (transcription) {
      speak({ text: transcription });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Recording Controls */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-colors",
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </motion.button>

          {/* Recording indicator */}
          {isRecording && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Recording Time */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-2xl font-mono font-semibold text-red-500">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-muted-foreground">Recording...</div>
        </motion.div>
      )}

      {/* Audio Playback */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={playAudio}
              className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <button
              onClick={transcribeAudio}
              disabled={isProcessing}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : (
                "Transcribe"
              )}
            </button>

            <button
              onClick={reset}
              className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Transcription */}
      {transcription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-foreground">Transcription</h3>
              <div className="flex gap-2">
                <button
                  onClick={speakTranscription}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  onClick={enhanceTranscription}
                  disabled={isProcessing}
                  className="p-1.5 text-muted-foreground hover:text-primary rounded transition-colors"
                  title="Enhance with AI"
                >
                  <Wand2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{transcription}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveAsNote}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Note
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Start Over
            </button>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Instructions */}
      {!audioUrl && !isRecording && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Click the microphone to start recording your voice note.</p>
          <p>AI will transcribe and help organize your thoughts.</p>
        </div>
      )}
    </div>
  );
}