import { type Project, type TaskItem, getTaskCountByProject } from "../utils/tasks"
import ProjectCard from "./ProjectCard"

interface ProjectListProps {
    projects: Project[]
    tasks: TaskItem[]
    onProjectClick: (projectId: string) => void
}

export default function ProjectList({ projects, tasks, onProjectClick }: ProjectListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    taskCount={getTaskCountByProject(tasks, project.id)}
                    onClick={() => onProjectClick(project.id)}
                />
            ))}
        </div>
    )
}
