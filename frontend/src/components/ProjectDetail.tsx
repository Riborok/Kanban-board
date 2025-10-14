import { useState } from "react"
import { TaskStatus, Project } from "../utils/tasks.ts"
import KanbanBoard from "./KanbanBoard.tsx"
import TaskForm from "./TaskForm.tsx"
import { useApp } from "../context/AppContext.tsx"

interface ProjectDetailProps {
    project: Project
    onBack: () => void
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
    const [showForm, setShowForm] = useState(false)
    const { tasks, addTask, updateTask, deleteTask } = useApp()

    const projectTasks = tasks.filter((task) => task.projectId === project.id)

    const handleCreateTask = async (
        title: string,
        description: string,
        user: string,
        status: TaskStatus
    ) => {
        try {
            await addTask({
                title,
                description,
                user,
                status,
                projectId: project.id,
            })
            setShowForm(false)
        } catch (error) {
            console.error("Failed to create task:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={onBack}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                        ← Назад
                    </button>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                        {project.description && (
                            <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-violet-600 text-white px-5 py-2 rounded hover:bg-violet-700 transition-colors font-medium"
                    >
                        {showForm ? "Отменить" : "Создать задачу"}
                    </button>
                </div>

                {project.users && project.users.length > 0 && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">
                            Участники проекта:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {project.users.map((user) => (
                                <div key={user.id} className="bg-gray-700 text-white px-3 py-2 rounded">
                                    {user.name || user.login}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowForm(false)} />
            )}

            <KanbanBoard tasks={projectTasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} />
        </div>
    )
}
