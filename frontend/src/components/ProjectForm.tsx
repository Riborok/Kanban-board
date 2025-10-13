import { useState, FormEvent } from "react"

interface ProjectFormProps {
    onSubmit: (name: string) => void
    onCancel: () => void
}

export default function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
    const [name, setName] = useState("")

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit(name)
            setName("")
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 mb-4"
        >
            <h3 className="text-lg font-semibold mb-3 text-white">Создать проект</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                    Название проекта*
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
                    required
                    placeholder="Введите название проекта"
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
                >
                    Создать
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                >
                    Отмена
                </button>
            </div>
        </form>
    )
}
