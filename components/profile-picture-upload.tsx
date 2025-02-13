import * as React from 'react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, CropIcon, Save, RotateCcw, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import ReactCrop, { type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB - reasonable for high quality images
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const DESIRED_IMAGE_SIZE = 400; // Width and height in pixels
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Final size after compression
  maxWidthOrHeight: DESIRED_IMAGE_SIZE,
  useWebWorker: true,
  fileType: 'image/jpeg', // Convert all to JPEG for consistency
};

// Additional security checks for images
const validateImage = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // Check if it's actually an image
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file extension matches content type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const expectedTypes = {
    'jpeg': ['image/jpeg', 'image/jpg'],
    'jpg': ['image/jpeg', 'image/jpg'],
    'png': ['image/png'],
    'gif': ['image/gif'],
  };
  
  const isExtensionValid = extension && 
    expectedTypes[extension as keyof typeof expectedTypes]?.includes(file.type);
  
  if (!isExtensionValid) {
    return { isValid: false, error: 'File extension does not match content type' };
  }

  // Load image to verify it's a valid image file
  try {
    const imageUrl = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        // Check reasonable dimensions
        if (img.width < 50 || img.height < 50) {
          reject('Image dimensions too small');
        }
        if (img.width > 10000 || img.height > 10000) {
          reject('Image dimensions too large');
        }
        resolve(true);
      };
      img.onerror = () => reject('Invalid image file');
      img.src = imageUrl;
    });
    URL.revokeObjectURL(imageUrl);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error as string };
  }
};

interface ProfilePictureUploadProps {
  onFileSelect: (file: File | null) => void;
  agentType: 'leftcurve' | 'rightcurve';
}

export function ProfilePictureUpload({ onFileSelect, agentType }: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [crop, setCrop] = useState<PixelCrop>({
    unit: 'px',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    setIsProcessing(true);
    try {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        showToast('INVALID_FILE_TYPE');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showToast('FILE_TOO_LARGE');
        return;
      }

      // Additional security validation
      const validation = await validateImage(file);
      if (!validation.isValid) {
        showToast('INVALID_FILE_TYPE');
        console.error('Image validation failed:', validation.error);
        return;
      }

      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsCropDialogOpen(true);
    } catch (error) {
      console.error('Error processing image:', error);
      showToast('AGENT_ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setOriginalFile(null);
    onFileSelect(null);
  };

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    setImageRef(img);
    // Set initial crop to center square
    const minSize = Math.min(img.width, img.height);
    const x = (img.width - minSize) / 2;
    const y = (img.height - minSize) / 2;
    setCrop({
      unit: 'px',
      width: minSize,
      height: minSize,
      x,
      y,
    });
  }, []);

  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
    originalFile: File
  ): Promise<File> => {
    console.log('🔍 Original file:', {
      name: originalFile.name,
      type: originalFile.type,
      size: originalFile.size
    });

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = DESIRED_IMAGE_SIZE;
    canvas.height = DESIRED_IMAGE_SIZE;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      DESIRED_IMAGE_SIZE,
      DESIRED_IMAGE_SIZE
    );

    // Get original file extension
    const extension = originalFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = originalFile.type || 'image/jpeg';
    const newFileName = `profile.${extension}`;

    console.log('📝 Creating new file:', {
      newFileName,
      mimeType
    });

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, mimeType, 0.95);
    });

    return new File([blob], newFileName, { type: mimeType });
  };

  const handleCropComplete = async () => {
    if (!imageRef || !crop.width || !crop.height || !originalFile) return;

    try {
      console.log('✂️ Starting image crop process');
      // Get cropped image
      const croppedFile = await getCroppedImg(imageRef, crop, originalFile);
      console.log('✅ Image cropped:', {
        name: croppedFile.name,
        type: croppedFile.type,
        size: `${(croppedFile.size / (1024 * 1024)).toFixed(2)}MB`
      });

      // Compress the cropped image
      console.log('🗜️ Starting compression with options:', COMPRESSION_OPTIONS);
      const compressedFile = await imageCompression(croppedFile, {
        ...COMPRESSION_OPTIONS,
        fileType: croppedFile.type as string,
      });

      // Ensure proper filename is preserved after compression
      const finalFile = new File(
        [compressedFile], 
        croppedFile.name, 
        { type: croppedFile.type }
      );

      console.log('✅ Final processed image:', {
        name: finalFile.name,
        type: finalFile.type,
        size: `${(finalFile.size / (1024 * 1024)).toFixed(2)}MB`
      });

      // Create preview URL
      const newPreviewUrl = URL.createObjectURL(finalFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(newPreviewUrl);
      onFileSelect(finalFile);
      setIsCropDialogOpen(false);
    } catch (error) {
      console.error('❌ Error processing image:', error);
      showToast('AGENT_ERROR');
    }
  };

  const handleReset = () => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
      setCrop({
        unit: 'px',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Label className="text-base font-medium">Profile Picture (Optional)</Label>
        
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="profile-picture"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
              ${agentType === 'leftcurve' 
                ? 'hover:border-yellow-500 hover:bg-yellow-500/5' 
                : 'hover:border-purple-500 hover:bg-purple-500/5'
              } ${previewUrl ? 'border-none' : ''}`}
          >
            {previewUrl ? (
              <div className="relative w-full h-full group">
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsCropDialogOpen(true);
                    }}
                    className={`${
                      agentType === 'leftcurve'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-purple-500 hover:bg-purple-600'
                    } text-white`}
                  >
                    <CropIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove();
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-8 h-8 mb-4 ${agentType === 'leftcurve' ? 'text-yellow-500' : 'text-purple-500'}`} />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF (MAX. 20MB)
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>Will be compressed to {COMPRESSION_OPTIONS.maxSizeMB}MB</span>
                    </div>
                  </>
                )}
              </div>
            )}
            <input
              id="profile-picture"
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>
        </div>
      </div>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="max-w-[800px] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className={`text-xl font-bold ${
              agentType === 'leftcurve' ? 'text-yellow-500' : 'text-purple-500'
            }`}>
              Crop Your Profile Picture
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {previewUrl && (
              <div className="relative max-h-[500px] overflow-auto rounded-lg border-2 border-muted">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={1}
                  className="max-w-full"
                >
                  <img
                    src={previewUrl}
                    alt="Crop preview"
                    onLoad={(e) => onImageLoad(e.currentTarget)}
                    className="max-w-full"
                  />
                </ReactCrop>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCropDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCropComplete}
                  className={`${
                    agentType === 'leftcurve'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save & Apply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 