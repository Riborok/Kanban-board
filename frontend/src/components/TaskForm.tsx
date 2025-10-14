import { useState, FormEvent } from "react"
import { TaskStatus } from "../utils/tasks"

interface TaskFormProps {
    onSubmit: (title: string, description: string, user: string, status: TaskStatus) => void
    onCancel: () => void
}

export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [user, setUser] = useState("")
    const [status, setStatus] = useState<TaskStatus>("todo")

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (title.trim() && user.trim()) {
            onSubmit(title, description, user, status)
            setTitle("")
            setDescription("")
            setUser("")
            setStatus("todo")
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6"
        >
            <h3 className="text-lg font-semibold text-white mb-4">Создать задачу</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Название*
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
                        placeholder="Введите название задачи"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Описание
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:border-violet-500 outline-none resize-none"
                        rows={4}
                        placeholder="Опишите задачу..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        ID Пользователя*
                    </label>
                    <input
                        type="text"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
                        placeholder="Введите ID пользователя"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Статус
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:border-violet-500 outline-none cursor-pointer"
                    >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    type="submit"
                    className="flex-1 bg-violet-600 text-white px-5 py-2 rounded hover:bg-violet-700 transition-colors font-medium"
                >
                    Создать
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-700 text-white px-5 py-2 rounded hover:bg-gray-600 transition-colors font-medium"
                >
                    Отмена
                </button>
            </div>
        </form>
    )
}
