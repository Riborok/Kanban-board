import { Project } from "../utils/tasks"

interface ProjectCardProps {
    project: Project
    taskCount: number
    onClick: () => void
}

export default function ProjectCard({ project, taskCount, onClick }: ProjectCardProps) {
    return (
        <div
            onClick={onClick}
            className="border-2 border-gray-600 rounded-lg p-4 hover:border-violet-500 cursor-pointer bg-gray-800"
        >
            <h3 className="text-lg font-semibold mb-2 text-white">{project.name}</h3>
            <p className="text-gray-300">
                Задач: <span className="font-medium text-violet-400">{taskCount}</span>
            </p>
        </div>
    )
}
