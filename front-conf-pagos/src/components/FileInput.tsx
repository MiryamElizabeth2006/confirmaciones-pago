/**
 * Componente FileInput reutilizable para seleccionar archivos
 */

import { InputHTMLAttributes, forwardRef, useState, useRef } from 'react';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  showPreview?: boolean;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, accept, onFileChange, showPreview = true, className = '', ...props }, ref) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const actualRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setSelectedFile(file);

      // Generar preview si es una imagen
      if (file && showPreview && file.type.startsWith('image/')) {
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
      if (actualRef.current) {
        actualRef.current.value = '';
      }
      onFileChange?.(null);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={actualRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className={`
                block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                ${error ? 'border-red-500' : ''}
                ${className}
              `}
              {...props}
            />
            {selectedFile && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Eliminar
              </button>
            )}
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-600">
              <p>Archivo seleccionado: {selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                Tamaño: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {preview && showPreview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
