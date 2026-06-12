import { useState } from "react";
import TaskEditModal from "../components/TaskEditModal";

function TaskList() {
  const role = "PROJECT_MANAGER";

  const [selectedTask, setSelectedTask] = useState(null);

  const tasks = [
    {
      id: 1,
      title: "Login API",
      assignee: "John",
      status: "TODO",
      priority: "HIGH",
    },
    {
      id: 2,
      title: "Dashboard UI",
      assignee: "Sarah",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Task List
      </h1>

      <table className="border w-full">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Assignee</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Priority</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="border p-2">
                {task.title}
              </td>

              <td className="border p-2">
                {task.assignee}
              </td>

              <td className="border p-2">
                {task.status}
              </td>

              <td className="border p-2">
                {task.priority}
              </td>

              <td className="border p-2">
                {role !== "COLLABORATOR" && (
                  <button
                    onClick={() =>
                      setSelectedTask(task)
                    }
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TaskEditModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

export default TaskList;