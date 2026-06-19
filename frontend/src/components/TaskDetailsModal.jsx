import { useState, useEffect } from "react";
import axios from "axios";
import FileDropZone from "./FileDropZone";

const TaskDetailsModal = ({ task, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);



  // ✅ FETCH COMMENTS FROM BACKEND
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

  // ✅ LOAD COMMENTS WHEN MODAL OPENS
  useEffect(() => {
    if (task) {
      fetchComments();
      fetchAttachments();
    }
  }, [task]);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">

          {/* Title / Editable Title */}
          <div className="flex-1 pr-4">
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full 
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-800">
                {task.title}
              </h2>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Edit / Save Toggle */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white 
                   px-3 py-1.5 rounded text-sm transition"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveTask}
                  className="bg-green-500 hover:bg-green-600 text-white 
                     px-3 py-1.5 rounded text-sm transition"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(task.title); // reset changes (important UX fix)
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white 
                     px-3 py-1.5 rounded text-sm transition"
                >
                  Cancel
                </button>
              </>
            )}

            {/* Close Modal Button (Professional Style) */}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center 
                 rounded-full text-gray-500 
                 hover:text-black hover:bg-gray-100 
                 transition duration-200 ml-2"
              aria-label="Close modal"
            >
              ✕
            </button>

          </div>
        </div>


        {/* Task Info */}
        <p className="mb-2">
          <span className="font-semibold">Project:</span> {task.project?.name}
        </p>

        <p className="mb-2">
          <span className="font-semibold">Assignee:</span> {task.assignedUser?.name}
        </p>

        <p className="mb-2">
          <span className="font-semibold">Priority:</span>{" "}

          {isEditing ? (
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="border rounded p-1 ml-2"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          ) : (
            task.priority
          )}
        </p>

        <hr className="my-4" />

        {/* Comments Section */}
        <h3 className="font-semibold mb-2">Comments</h3>

        <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">
                      {c.user?.name || "User"} commented
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      {c.content || c.text}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : "Just now"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-red-500 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded p-2 text-sm"
          />

          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">Attachments</h3>

        <FileDropZone
          onFileSelect={handleFileUpload}
        />

        {/* ✅  PROGRESS BAR HERE */}
        {uploading && (
          <div className="mb-3 p-3 bg-gray-50 border rounded">
            <p className="text-sm mb-1">Uploading...</p>

            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div
                className="h-2 bg-blue-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-1">
              {uploadProgress}%
            </p>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {attachments.map((file, index) => {
            const fileName = file.fileName || file.name;

            return (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">

                  <span className="text-lg">
                    {fileName?.toLowerCase().endsWith(".pdf")
                      ? "📄"
                      : fileName?.match(/\.(png|jpg|jpeg)$/i)
                        ? "🖼️"
                        : "📎"}
                  </span>

                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {fileName}
                  </span>

                </div>

                <button
                  onClick={() =>
                    handleDeleteAttachment(file.id)
                  }
                  className="text-red-500 text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default TaskDetailsModal;