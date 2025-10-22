import { memo, useRef, useCallback, useState } from 'react';
import { classNames } from '~/utils/classNames';
import { toast } from 'react-toastify';

interface ImageUploadButtonProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export interface UploadedImage {
  data: string; // base64
  mimeType: string;
  name: string;
  size: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (Claude API limit)
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const ImageUploadButton = memo(function ImageUploadButton({ 
  onImagesSelected, 
  disabled = false,
  maxImages = 5 
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const uploadedImages: UploadedImage[] = [];

    for (let i = 0; i < Math.min(files.length, maxImages); i++) {
      const file = files[i];

      // Validate file type
      if (!SUPPORTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Unsupported format. Use JPG, PNG, GIF, or WebP.`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File too large. Maximum 5MB per image.`);
        continue;
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        
        uploadedImages.push({
          data: base64,
          mimeType: file.type,
          name: file.name,
          size: file.size,
        });
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
        console.error('Image processing error:', error);
      }
    }

    if (uploadedImages.length > 0) {
      onImagesSelected(uploadedImages);
      toast.success(`${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} uploaded`);
    }

    setIsProcessing(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImagesSelected, maxImages]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  }, [processFiles]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isProcessing}
      />
      
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        title="Upload image (JPG, PNG, GIF, WebP)"
        className={classNames(
          'flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200',
          'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive',
          'text-bolt-elements-item-contentDefault hover:text-[#e86b47]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isProcessing ? (
          <div className="i-svg-spinners:90-ring-with-bg text-[#e86b47] text-xl"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        )}
      </button>
    </>
  );
});

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

