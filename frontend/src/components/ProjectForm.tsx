import { useState, FormEvent } from "react"

interface ProjectFormProps {
    onSubmit: (name: string, description: string) => void
    onCancel: () => void
}

export default function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit(name, description)
            setName("")
            setDescription("")
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6"
        >
            <h3 className="text-lg font-semibold text-white mb-4">Создать проект</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Название проекта*
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:border-violet-500 outline-none"
                        required
                        placeholder="Введите название проекта"
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
                        rows={3}
                        placeholder="Введите описание проекта"
                    />
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
