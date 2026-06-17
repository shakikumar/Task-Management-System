import { useState } from "react";

const TaskDetailsModal = ({ task, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  if (!task) return null;

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      user: "You",
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] rounded-xl p-6 shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{task.title}</h2>

          <button
            onClick={onClose}
            className="text-red-500 font-bold"
          >
            X
          </button>
        </div>

        {/* Task Info */}
        <p className="mb-2">
          <span className="font-semibold">Project:</span> {task.project?.name}
        </p>

        <p className="mb-2">
          <span className="font-semibold">Assignee:</span> {task.assignedUser?.name}
        </p>

        <p className="mb-2">
          <span className="font-semibold">Priority:</span> {task.priority}
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
                className="text-sm bg-gray-100 p-2 rounded"
              >
                <span className="font-semibold">{c.user}: </span>
                {c.text}
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

      </div>
    </div>
  );
};

export default TaskDetailsModal;