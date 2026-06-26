import { useState, useEffect } from "react";
import axios from "axios";
import FileDropZone from "./FileDropZone";
import { Edit, Save, Trash2, Send, Paperclip, MessageSquare } from "lucide-react";

const TaskDetailsModal = ({ task, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/comments/task/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setComments(res.data.comments);
    } catch (error) {
      console.log("Failed to load comments:", error);
    }
  };
  const fetchAttachments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/attachments/task/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAttachments(res.data.attachments);

    } catch (error) {
      console.log("Failed to load attachments:", error);
    }
  };
  useEffect(() => {
    if (task) {
      fetchComments();
      fetchAttachments();
    }
  }, [task]);

  

  useEffect(() => {
    if (task) {
      setEditTitle(task.title || "");
      setEditPriority(task.priority || "MEDIUM");
    }
  }, [task]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5001/api/comments/task/${task.id}`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setComments([res.data.comment, ...comments]);
      setCommentText("");
    } catch (error) {
      console.log("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this comment?");

      if (!confirmDelete) return;

      await axios.delete(
        `http://localhost:5001/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.log("Failed to delete comment:", error);
    }
  };

  const handleSaveTask = async () => {
    try {
      await axios.put(
        `http://localhost:5001/api/tasks/${task.id}`,
        {
          title: editTitle,
          priority: editPriority,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsEditing(false);

      alert("Task updated successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to update task");
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `http://localhost:5001/api/attachments/task/${task.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            );

            setUploadProgress(percent);
          },
        }
      );

      setAttachments((prev) => [
        res.data.attachment,
        ...prev,
      ]);

      setUploading(false);
      setUploadProgress(0);

    } catch (error) {
      console.log("Upload failed:", error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/attachments/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAttachments(
        attachments.filter(
          (a) => a.id !== attachmentId
        )
      );

    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/20 backdrop-blur-sm p-4 animate-fade-in">
      <style>{`
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-purple-100/45 shadow-2xl relative animate-scale-up">

        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-4">

          {/* Title */}
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-855">
              {task.title}
            </h2>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200/50 transition duration-200 ml-1 cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

          </div>
        </div>

        {/* Task Info Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 border border-purple-50 rounded-2xl p-4 mb-6 text-sm text-slate-700 font-semibold">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Project</span>
            <span className="text-slate-800 font-bold truncate">{task.project?.name || "No Project"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Assignee</span>
            <span className="text-slate-800 font-bold truncate">{task.assignedUser?.name || "Unassigned"}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Priority</span>
            {isEditing ? (
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="bg-white border border-purple-100 rounded-xl px-2 py-1 text-xs focus:outline-none cursor-pointer w-full max-w-[120px]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            ) : (
              <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm ${
                task.priority === "HIGH"
                  ? "bg-red-100 text-red-755 border-red-200/50"
                  : task.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-755 border-yellow-200/50"
                  : "bg-slate-100 text-slate-700 border-slate-200/50"
              }`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={17} className="text-violet-500" />
            <h3 className="font-bold text-slate-800">Comments</h3>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-1.5 scrollbar-thin">
            {comments.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold py-4 text-center bg-slate-50/50 border border-dashed border-purple-50 rounded-2xl">
                No comments shared yet
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50/75 border-l-4 border-violet-500 rounded-r-2xl p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-800">
                        {c.user?.name || "User"}
                      </p>

                      <p className="text-xs text-slate-650 mt-1 break-words leading-relaxed font-semibold">
                        {c.content || c.text}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1.5 font-bold">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString()
                          : "Just now"}
                      </p>
                    </div>

                    {c.user?.id === currentUser?.id && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-red-500 hover:text-red-700 text-[10px] font-bold hover:bg-red-50 px-2 py-1 rounded transition-all cursor-pointer shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          {currentUser?.role !== "ADMINISTRATOR" && (
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-white border border-purple-100 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />

              <button
                onClick={handleAddComment}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_8px_20px_rgba(124,58,237,0.25)] transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Send size={13} />
                Add
              </button>
            </div>
          )}
        </div>

        {/* Attachments Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Paperclip size={17} className="text-violet-500" />
            <h3 className="font-bold text-slate-800">Attachments</h3>
          </div>

          <FileDropZone
            onFileSelect={handleFileUpload}
          />

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mt-3 p-3.5 bg-violet-50/50 border border-violet-100/50 rounded-2xl">
              <p className="text-xs font-bold text-slate-700 mb-1">Uploading attachment...</p>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500 transition-all rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-1 font-bold">
                {uploadProgress}%
              </p>
            </div>
          )}

          {/* Attachment list */}
          <div className="mt-3 space-y-2">
            {attachments.map((file, index) => {
              const fileName = file.fileName || file.name;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border border-purple-100/50 hover:border-purple-200/80 rounded-2xl px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)] transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">
                      {fileName?.toLowerCase().endsWith(".pdf")
                        ? "📄"
                        : fileName?.match(/\.(png|jpg|jpeg)$/i)
                          ? "🖼️"
                          : "📎"}
                    </span>

                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-600 hover:text-violet-850 hover:underline font-semibold truncate max-w-[280px]"
                    >
                      {fileName}
                    </a>
                  </div>

                  <button
                    onClick={() => handleDeleteAttachment(file.id)}
                    className="text-red-500 hover:text-red-700 text-[10px] font-bold hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer shrink-0"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskDetailsModal;