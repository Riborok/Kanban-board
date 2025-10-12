import { useState } from "react"
import { TaskItem, TaskStatus, Project } from "../utils/tasks.ts"
import KanbanBoard from "./KanbanBoard.tsx"
import TaskForm from "./TaskForm.tsx"
import { generateId } from "../utils/id.ts"

interface ProjectDetailProps {
  project: Project
  tasks: TaskItem[]
  onAddTask: (task: TaskItem) => void
  onBack: () => void
}

export default function ProjectDetail({ project, tasks, onAddTask, onBack }: ProjectDetailProps) {
  const [showForm, setShowForm] = useState(false)

  const projectTasks = tasks.filter((task) => task.projectId === project.id)

  const handleCreateTask = (title: string, description: string, assignee: string, status: TaskStatus) => {
    const newTask: TaskItem = {
      id: generateId(),
      title,
      description,
      assignee,
      status,
      projectId: project.id,
    }
    onAddTask(newTask)
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ← Назад
          </button>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors"
        >
          {showForm ? "Отменить" : "+ Создать задачу"}
        </button>
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      <KanbanBoard tasks={projectTasks} />
    </div>
  )
}
