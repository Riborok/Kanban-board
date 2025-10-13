import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { generateId } from "../utils/id"
import ProjectList from "../components/ProjectList"
import ProjectDetail from "../components/ProjectDetail.tsx"
import ProjectForm from "../components/ProjectForm"

export default function Projects() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { projects, tasks, addProject } = useApp()
    const [showProjectForm, setShowProjectForm] = useState(false)

    const selectedProject = id ? projects.find((p) => p.id === id) : null

    const handleCreateProject = (name: string) => {
        const newProject = {
            id: generateId(),
            name,
        }
        addProject(newProject)
        setShowProjectForm(false)
    }

    const handleProjectClick = (projectId: string) => {
        navigate(`/projects/${projectId}`)
    }

    const handleBack = () => {
        navigate("/projects")
    }

    return (
        <section className="container mx-auto px-4">
            {selectedProject ? (
                <ProjectDetail project={selectedProject} onBack={handleBack} />
            ) : (
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Проекты</h2>
                        <button
                            onClick={() => setShowProjectForm(!showProjectForm)}
                            className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 cursor-pointer"
                        >
                            {showProjectForm ? "Отменить" : "+ Создать проект"}
                        </button>
                    </div>

                    {showProjectForm && (
                        <ProjectForm
                            onSubmit={handleCreateProject}
                            onCancel={() => setShowProjectForm(false)}
                        />
                    )}

                    <ProjectList
                        projects={projects}
                        tasks={tasks}
                        onProjectClick={handleProjectClick}
                    />
                </div>
            )}
        </section>
    )
}
