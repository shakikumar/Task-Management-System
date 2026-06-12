function TaskEditModal({ task, onClose }) {
if (!task) return null;

return ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center"> <div className="bg-white p-6 rounded-lg w-96 shadow-lg"> <h2 className="text-xl font-bold mb-4">
Edit Task </h2>

```
    <label className="block mb-1 font-medium">
      Task Title
    </label>
    <input
      type="text"
      defaultValue={task.title}
      className="border p-2 w-full mb-3"
    />

    <label className="block mb-1 font-medium">
      Assignee
    </label>
    <select className="border p-2 w-full mb-3">
      <option>Sarah Chen</option>
      <option>Marcus Webb</option>
      <option>Elena Rodriguez</option>
    </select>

    <label className="block mb-1 font-medium">
      Status
    </label>
    <select className="border p-2 w-full mb-3">
      <option>TODO</option>
      <option>IN_PROGRESS</option>
      <option>COMPLETED</option>
    </select>

    <label className="block mb-1 font-medium">
      Priority
    </label>
    <select className="border p-2 w-full mb-3">
      <option>LOW</option>
      <option>MEDIUM</option>
      <option>HIGH</option>
    </select>

    <label className="block mb-1 font-medium">
      Due Date
    </label>
    <input
      type="date"
      className="border p-2 w-full mb-4"
    />

    <div className="flex gap-2 justify-end">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      <button
        onClick={onClose}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
</div>

);
}

export default TaskEditModal;
