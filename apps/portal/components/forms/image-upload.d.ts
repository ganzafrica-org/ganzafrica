interface ImageUploadProps {
    onImageChange: (file: File | null) => void;
    initialImage?: string;
    className?: string;
    label?: string;
    description?: string;
}
export declare function ImageUpload({ onImageChange, initialImage, className, label, description }: ImageUploadProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=image-upload.d.ts.map