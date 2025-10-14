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
        assignee: string,
        status: TaskStatus
    ) => {
        try {
            await addTask({
                title,
                description,
                assignee,
                status,
                projectId: project.id,
            })
            setShowForm(false)
        } catch (error) {
            console.error("Failed to create task:", error)
        }
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                    >
                        ← Назад
                    </button>
                    <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 cursor-pointer"
                >
                    {showForm ? "Отменить" : "+ Создать задачу"}
                </button>
            </div>

            {showForm && (
                <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowForm(false)} />
            )}

            <KanbanBoard tasks={projectTasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} />
        </div>
    )
}
