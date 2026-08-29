import { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import type { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperModalProps {
    imageSrc: string;
    onCropComplete: (croppedFile: File) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageCropperModal({ imageSrc, onCropComplete, onCancel, aspectRatio = 1 }: ImageCropperModalProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (aspectRatio) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspectRatio));
        }
    };

    const handleSave = async () => {
        if (completedCrop?.width && completedCrop?.height && imgRef.current) {
            const canvas = document.createElement("canvas");
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
            canvas.width = completedCrop.width;
            canvas.height = completedCrop.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            ctx.drawImage(
                imgRef.current,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width,
                completedCrop.height,
            );

            canvas.toBlob((blob) => {
                if (!blob) return;
                const file = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
                onCropComplete(file);
            }, "image/jpeg", 0.9);
        } else {
            // If no crop was made, just return the original file via blob or cancel
            onCancel();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                    <h3 className="font-semibold text-zinc-800">Crop Image</h3>
                    <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-zinc-900 min-h-[300px]">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspectRatio}
                        className="max-h-full"
                    >
                        <img 
                            ref={imgRef}
                            src={imageSrc} 
                            onLoad={onImageLoad} 
                            className="max-h-[60vh] w-auto object-contain"
                            crossOrigin="anonymous"
                            alt="Crop me"
                        />
                    </ReactCrop>
                </div>
                
                <div className="p-4 border-t border-zinc-200 flex justify-end gap-3 bg-zinc-50">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg font-medium text-zinc-600 hover:bg-zinc-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-5 py-2 rounded-lg font-medium text-white bg-app-orange hover:bg-orange-600 transition-colors">
                        Crop & Save
                    </button>
                </div>
            </div>
        </div>
    );
}
