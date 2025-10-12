import { useState, FormEvent } from "react"
import { TaskStatus } from "../utils/tasks"

interface TaskFormProps {
  onSubmit: (title: string, description: string, assignee: string, status: TaskStatus) => void
  onCancel: () => void
}

export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState("")
  const [status, setStatus] = useState<TaskStatus>("todo")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (title.trim() && assignee.trim()) {
      onSubmit(title, description, assignee, status)
      setTitle("")
      setDescription("")
      setAssignee("")
      setStatus("todo")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Создать задачу</h3>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-300">Название*</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-300">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
          rows={3}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-300">Исполнитель*</label>
        <input
          type="text"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-300">Статус</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition-colors"
        >
          Создать
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
