import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";

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
    <div className="w-full select-none">
      {/* Drop Area */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2
          ${isDragging 
            ? "border-violet-500 bg-violet-50/50 scale-[1.01] shadow-[0_8px_20px_rgba(124,58,237,0.05)]" 
            : "border-purple-200 bg-purple-50/10 hover:border-purple-300 hover:bg-purple-50/20"
          }`}
      >
        <UploadCloud size={24} className={`transition-colors ${isDragging ? "text-violet-650 animate-bounce" : "text-purple-400"}`} />

        <p className="text-xs font-semibold text-slate-600">
          Drag & drop files here or{" "}
          <span className="text-violet-600 hover:text-violet-750 transition-colors font-bold underline">click to upload</span>
        </p>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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