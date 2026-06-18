import { useState, useRef } from "react";

export default function FileDropZone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="w-full">
      {/* Drop Area */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-sm" 
            : "border-gray-300 hover:border-gray-400"
          }`}
      >
        <p className="text-sm text-gray-600">
          Drag & drop files here or{" "}
          <span className="text-blue-500 font-medium">click to upload</span>
        </p>

        <p className="text-xs text-gray-400 mt-1">
          PDF, PNG, JPG, DOCX supported
        </p>
      </div>

      {/* Hidden input */}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}