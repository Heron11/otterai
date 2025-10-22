import { memo } from 'react';
import { classNames } from '~/utils/classNames';

interface VoiceButtonProps {
  isRecording: boolean;
  isSupported: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceButton = memo(function VoiceButton({ 
  isRecording, 
  isSupported, 
  onClick, 
  disabled = false 
}: VoiceButtonProps) {
  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={isRecording ? "Stop recording" : "Start voice input (Click to toggle)"}
      className={classNames(
        'flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200',
        {
          'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse': isRecording,
          'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-item-contentDefault hover:text-[#e86b47] disabled:opacity-50 disabled:cursor-not-allowed': !isRecording,
        }
      )}
    >
      {isRecording ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
        </svg>
      )}
    </button>
  );
});

