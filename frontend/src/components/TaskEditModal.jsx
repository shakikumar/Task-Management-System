import { useState } from "react";

function TaskEditModal({ task, users, onClose, onSave }) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assignee, setAssignee] = useState(task.assignedUser?._id);
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-4 w-96">
        <h2 className="font-bold mb-3">Edit Task</h2>

        <input
          className="border p-2 w-full mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <select
          className="border p-2 w-full mb-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {/* DUE DATE (IMPORTANT FOR PHASE 3) */}
        <input
          type="date"
          className="border p-2 w-full mb-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-2"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        >
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2 mt-3">
          <button
            className="bg-green-600 text-white px-3 py-1"
            onClick={() =>
              onSave(task._id, {
                title,
                status,
                priority,
                assignedUserId: assignee,
                dueDate,
              })
            }
          >
            Save
          </button>

          <button
            className="bg-gray-400 px-3 py-1"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditModal;