'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  Mic,
  FileText
} from 'lucide-react';
import { VARKReadAloudData } from '@/types/vark-module';

interface ReadAloudPlayerProps {
  data: VARKReadAloudData;
  onComplete?: () => void;
}

export const ReadAloudPlayer: React.FC<ReadAloudPlayerProps> = ({
  data,
  onComplete
}) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(data.voice_settings?.rate || 1);
  const [pitch, setPitch] = useState(data.voice_settings?.pitch || 1);
  const [volume, setVolume] = useState(data.voice_settings?.volume || 1);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastActionTimeRef = useRef<number>(0);

  // Extract words from content and reset player state on section change
  useEffect(() => {
    console.log('📝 Processing content for read-aloud (section changed)');
    console.log('Content length:', data.content?.length || 0);
    
    // Stop any ongoing speech when section changes
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Reset player state
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    setProgress(0);
    
    if (!data.content) {
      console.warn('No content provided for read-aloud');
      wordsRef.current = [];
      return;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.content;
    const text = tempDiv.textContent || '';
    wordsRef.current = text.split(/\s+/).filter(word => word.length > 0);
    
    console.log('Extracted words:', wordsRef.current.length);
    console.log('🔄 Player reset for new section');
  }, [data.content]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) {
        console.warn('Speech Synthesis not supported');
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      setAvailableVoices(voices);
      
      // Set default voice
      if (!selectedVoice && voices.length > 0) {
        const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        setSelectedVoice(defaultVoice.name);
        console.log('Selected default voice:', defaultVoice.name);
      } else if (voices.length === 0) {
        console.warn('No voices available for speech synthesis');
      }
    };

    // Load voices immediately
    loadVoices();
    
    // Also load when voices change (some browsers load them asynchronously)
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up Read Aloud Player');
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Highlight current word
  const highlightWord = useCallback((index: number) => {
    if (!contentRef.current || !data.highlight_settings?.enabled) {
      console.log('Highlighting disabled or no content ref');
      return;
    }

    const spans = contentRef.current.querySelectorAll('.word-span');
    console.log(`Highlighting word ${index}, found ${spans.length} spans`);
    
    spans.forEach((span, i) => {
      if (i === index) {
        span.classList.add('highlighted');
        console.log(`✨ Highlighted word ${index}:`, span.textContent);
        // Scroll into view if needed
        span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        span.classList.remove('highlighted');
      }
    });
  }, [data.highlight_settings]);

  // Split content into word spans
  const getContentWithSpans = useCallback(() => {
    // If highlighting is disabled, return original content to preserve formatting
    if (!data.highlight_settings?.enabled) {
      console.log('🎨 Word highlighting disabled - preserving original formatting');
      return { __html: data.content };
    }

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.content;
    
    // Function to wrap text nodes with spans while preserving formatting
    const wrapTextNodes = (node: Node, wordIndex: { current: number }): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const words = text.split(/(\s+)/).filter(part => part.length > 0);
        
        const fragment = document.createDocumentFragment();
        words.forEach((part) => {
          if (/\s+/.test(part)) {
            // Whitespace - preserve it exactly
            fragment.appendChild(document.createTextNode(part));
          } else if (part.trim().length > 0) {
            // Word - wrap it in a span with minimal styling impact
            const span = document.createElement('span');
            span.className = 'word-span';
            span.setAttribute('data-index', String(wordIndex.current));
            span.textContent = part;
            // Preserve inline styles by making span display inline
            span.style.display = 'inline';
            span.style.margin = '0';
            span.style.padding = '0';
            span.style.border = 'none';
            span.style.background = 'transparent';
            fragment.appendChild(span);
            wordIndex.current++;
          }
        });
        
        node.parentNode?.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {

      }
    };

    const wordIndex = { current: 0 };
    Array.from(tempDiv.childNodes).forEach(child => wrapTextNodes(child, wordIndex));

    console.log(`Created ${wordIndex.current} word spans`);
    return { __html: tempDiv.innerHTML };
  }, [data.content, data.highlight_settings]);

  // Play speech
  const play = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTimeRef.current;
    
    // Debounce rapid clicks (prevent actions within 500ms)
    if (timeSinceLastAction < 500) {
      console.log('⏳ Action debounced, too soon since last action');
      return;
    }
    
    lastActionTimeRef.current = now;
    
    console.log('🎵 Play button clicked');
    console.log('Words available:', wordsRef.current.length);
    console.log('Available voices:', availableVoices.length);
    console.log('Selected voice:', selectedVoice);
    console.log('Speech synthesis status:', {
      speaking: window.speechSynthesis?.speaking,
      pending: window.speechSynthesis?.pending,
      paused: window.speechSynthesis?.paused
    });
    
    if (!wordsRef.current.length) {
      console.error('No words to speak');
      return;
    }

    // Check if Speech Synthesis is supported
    if (!window.speechSynthesis) {
      console.error('Speech Synthesis not supported in this browser');
      alert('Text-to-speech is not supported in your browser. Please try using Chrome, Firefox, or Safari.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const text = wordsRef.current.join(' ').trim();
    
    // Validate text content
    if (!text || text.length === 0) {
      console.error('No text content to speak');
      alert('No text content available for speech synthesis.');
      return;
    }
    
    if (text.length > 32767) {
      console.error('Text too long for speech synthesis:', text.length);
      alert('Text is too long for speech synthesis. Please use shorter content.');
      return;
    }
    
    console.log('Starting speech synthesis for text length:', text.length);
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice
    const voice = availableVoices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = data.voice_settings?.language || 'en-US';

    // Track progress
    let wordIndex = 0;
    utterance.onboundary = (event) => {
      console.log('Boundary event:', event.name, 'at char:', event.charIndex);
      if (event.name === 'word') {
        console.log(`🗣️ Speaking word ${wordIndex}:`, wordsRef.current[wordIndex]);
        setCurrentWordIndex(wordIndex);
        highlightWord(wordIndex);
        wordIndex++;
        
        const progressPercent = (wordIndex / wordsRef.current.length) * 100;
        setProgress(progressPercent);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      setProgress(100);
      highlightWord(-1);
      
      if (onComplete) {
        onComplete();
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', {
        error: event.error,
        type: event.type,
        elapsedTime: event.elapsedTime,
        charIndex: event.charIndex,
        name: event.name
      });
      
      // Provide user-friendly error messages
      let errorMessage = 'Speech synthesis failed. ';
      let shouldShowAlert = true;
      
      switch (event.error) {
        case 'interrupted':
          console.log('Speech was interrupted (normal behavior)');
          shouldShowAlert = false; // Don't show alert for interruptions
          break;
        case 'network':
          errorMessage += 'Please check your internet connection.';
          break;
        case 'synthesis-failed':
          errorMessage += 'Text-to-speech service is unavailable.';
          break;
        case 'synthesis-unavailable':
          errorMessage += 'Text-to-speech is not available on this device.';
          break;
        case 'voice-unavailable':
          errorMessage += 'Selected voice is not available. Try a different voice.';
          break;
        case 'text-too-long':
          errorMessage += 'Text is too long for speech synthesis.';
          break;
        case 'invalid-argument':
          errorMessage += 'Invalid speech settings detected.';
          break;
        default:
          errorMessage += 'Unknown error occurred.';
      }
      
      if (shouldShowAlert) {
        console.warn('User-friendly error:', errorMessage);
        // You could show a toast notification here instead of alert
        // toast.error(errorMessage);
      }
      
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      setProgress(0);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, [availableVoices, selectedVoice, rate, pitch, volume, data.voice_settings, highlightWord, onComplete]);

  // Pause speech
  const pause = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTimeRef.current;
    
    // Debounce rapid clicks (prevent actions within 300ms for pause)
    if (timeSinceLastAction < 300) {
      console.log('⏳ Pause action debounced, too soon since last action');
      return;
    }
    
    lastActionTimeRef.current = now;
    
    console.log('⏸️ Pause/Resume button clicked');
    console.log('Current state:', { isPlaying, isPaused });
    console.log('Speech synthesis status:', {
      speaking: window.speechSynthesis?.speaking,
      pending: window.speechSynthesis?.pending,
      paused: window.speechSynthesis?.paused
    });
    
    if (!window.speechSynthesis) {
      console.error('Speech Synthesis not available');
      return;
    }
    
    try {
      if (isPlaying && !isPaused) {
        console.log('Pausing speech...');
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else if (isPaused) {
        console.log('Resuming speech...');
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        console.log('Invalid state for pause/resume');
      }
    } catch (error) {
      console.error('Error in pause/resume:', error);
      // Reset state on error
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);

  // Stop speech
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    setProgress(0);
    highlightWord(-1);
  }, [highlightWord]);

  // Skip forward
  const skipForward = useCallback(() => {
    // Stop and restart from 10 words ahead
    const newIndex = Math.min(currentWordIndex + 10, wordsRef.current.length - 1);
    stop();
    setTimeout(() => {
      setCurrentWordIndex(newIndex);
      play();
    }, 100);
  }, [currentWordIndex, stop, play]);

  // Skip backward
  const skipBackward = useCallback(() => {
    // Stop and restart from 10 words behind
    const newIndex = Math.max(currentWordIndex - 10, 0);
    stop();
    setTimeout(() => {
      setCurrentWordIndex(newIndex);
      play();
    }, 100);
  }, [currentWordIndex, stop, play]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const highlightColor = data.highlight_settings?.color || '#FFD700';
  const highlightStyle = data.highlight_settings?.style || 'word';
  const highlightAnimation = data.highlight_settings?.animation || 'pulse';



  // Add this right after your other hooks
useEffect(() => {
  if (!contentRef.current) return;

  // Apply styles to all images
  contentRef.current.querySelectorAll('img').forEach(img => {

    console.log({img})
     img.style = '';
    img.style.display = 'block';
    img.style.margin = '1rem auto';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '0.5rem';
    img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  });
}, [getContentWithSpans]); // Re-run when content changes

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{data.title}</CardTitle>
              <p className="text-sm text-purple-100">
                Read Aloud with Highlighting
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white text-purple-600">
            Auditory Learning
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Player Controls - MOVED TO TOP */}
        {data.player_controls?.show_controls !== false && (
          <div className="space-y-4 bg-white border-2 border-purple-200 rounded-lg p-4">
            {/* Progress Bar */}
            {data.player_controls?.show_progress !== false && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-3">
              {data.player_controls?.enable_skip && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={skipBackward}
                  disabled={!isPlaying}
                  className="h-12 w-12"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
              )}

              {!isPlaying || isPaused ? (
                <Button
                  size="lg"
                  onClick={play}
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={pause}
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Pause className="w-6 h-6" />
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={stop}
                disabled={!isPlaying}
                className="h-12 w-12"
              >
                <Square className="w-5 h-5" />
              </Button>

              {data.player_controls?.enable_skip && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={skipForward}
                  disabled={!isPlaying}
                  className="h-12 w-12"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>Volume</span>
                </div>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={([value]) => setVolume(value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Speed Control */}
            {data.player_controls?.show_speed_control && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Speed</span>
                  <span>{rate.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}

            {/* Voice Selector */}
            {data.player_controls?.show_voice_selector && availableVoices.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-gray-600 font-medium">Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Content Display with Highlighting - NOW BELOW CONTROLS */}
        <div
  ref={contentRef}
  className="content-container prose prose-lg max-w-none p-6 bg-gray-50 rounded-lg border-2 border-gray-200"
  dangerouslySetInnerHTML={getContentWithSpans()}
  style={{
    ['--highlight-color' as any]: highlightColor,
    fontSize: data.font_size || '1rem',
    lineHeight: 1.6,
    color: '#374151',
    textAlign: 'left', // keep text left-aligned
  }}
/>

        {/* Custom CSS for highlighting */}
        <style jsx>{`

.content-container img {
  display: block !important;
  margin: 0 auto !important;
  max-width: 100% !important;
}


          .word-span {
            display: inline;
            padding: 2px;
            border-radius: 3px;
            transition: all 0.3s ease-in-out;
          }

          .word-span.highlighted {
            background-color: var(--highlight-color) !important;
            ${highlightAnimation === 'pulse' ? 'animation: pulse 0.6s ease-in-out;' : ''}
            ${highlightAnimation === 'fade' ? 'animation: fade 0.6s ease-in-out;' : ''}
            ${highlightAnimation === 'underline' ? 'border-bottom: 3px solid var(--highlight-color);' : ''}
            font-weight: 700;
            color: #000;
            padding: 4px 6px;
            box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }

          @keyframes fade {
            0% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}</style>

        {/* Transcript Toggle */}
        {data.accessibility?.enable_transcript && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
            {showTranscript && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data.content }}
                />
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center space-x-4">
            <span>Words: {wordsRef.current.length}</span>
            <span>•</span>
            <span>Est. Time: {Math.ceil(wordsRef.current.length / (rate * 150))} min</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {isPlaying ? (isPaused ? 'Paused' : 'Playing') : 'Ready'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadAloudPlayer;
