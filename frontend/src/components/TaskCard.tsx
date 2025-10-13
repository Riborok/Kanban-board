import { useState } from "react"
import { TaskItem, TaskStatus } from "../utils/tasks"

interface TaskCardProps {
  task: TaskItem
  onUpdate?: (taskId: string, updates: Partial<TaskItem>) => void
  onDelete?: (taskId: string) => void
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [assignee, setAssignee] = useState(task.assignee)
  const [status, setStatus] = useState<TaskStatus>(task.status)

  const handleSave = () => {
    if (onUpdate && title.trim() && assignee.trim()) {
      onUpdate(task.id, { title, description, assignee, status })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setTitle(task.title)
    setDescription(task.description)
    setAssignee(task.assignee)
    setStatus(task.status)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(task.id)
  }

  if (isEditing) {
    return (
      <div className="bg-gray-800 border-2 border-violet-500 rounded-lg p-3 mb-3">
        <div className="mb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:border-violet-500 outline-none"
            placeholder="Название"
          />
        </div>
        <div className="mb-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:border-violet-500 outline-none"
            rows={2}
            placeholder="Описание"
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:border-violet-500 outline-none"
            placeholder="Исполнитель"
          />
        </div>
        <div className="mb-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 text-sm focus:border-violet-500 outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-violet-600 text-white px-3 py-1 rounded text-sm hover:bg-violet-700 cursor-pointer"
          >
            Сохранить
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 cursor-pointer"
          >
            Отмена
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-3 mb-3 hover:border-violet-500">
      <h4 className="font-semibold mb-2 text-white">{task.title}</h4>
      <p className="text-sm text-gray-300 mb-2">{task.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs text-gray-400">Исполнитель:</span>
          <span className="text-xs ml-2 font-medium text-violet-400">{task.assignee}</span>
        </div>
        <div className="flex gap-1">
          {onUpdate && (
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer text-violet-400 hover:text-violet-300 text-xs px-2 py-1 rounded hover:bg-gray-700"
              title="Редактировать"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="cursor-pointer text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-gray-700"
              title="Удалить"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
