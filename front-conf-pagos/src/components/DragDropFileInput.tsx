/**
 * Componente de drag & drop para archivos con diseño moderno
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface DragDropFileInputProps {
  label?: string;
  error?: string;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  required?: boolean;
  disabled?: boolean;
  maxSize?: number; // en bytes
}

export function DragDropFileInput({
  label,
  error,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  onFileChange,
  required = false,
  disabled = false,
  maxSize = 10 * 1024 * 1024, // 10 MB por defecto
}: DragDropFileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validar tamaño
    if (file.size > maxSize) {
      alert(`El archivo es muy grande. Máximo ${maxSize / (1024 * 1024)} MB`);
      return;
    }

    setSelectedFile(file);

    // Generar preview si es una imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileChange?.(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileChange?.(null);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? 'border-red-500 bg-red-50'
              : error
                ? 'border-red-500 bg-red-50'
                : 'border-red-400 bg-white hover:border-red-500 hover:bg-red-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          required={required}
        />

        {selectedFile ? (
          <div className="space-y-3">
            {preview ? (
              // Vista previa de imagen
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Eliminar archivo
                </button>
              </div>
            ) : (
              // Vista para archivos no-imagen (PDF, etc.)
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <svg
                    className="h-12 w-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Eliminar archivo
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <svg
                className="h-20 w-20 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-600 mb-2">
              Selecciona un archivo o arrastra y suelta
            </p>
            <p className="text-xs font-medium text-gray-600">PNG, JPG, PDF HASTA 10MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
