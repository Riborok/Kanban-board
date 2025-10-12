import { useState } from "react"
import { Project, TaskItem } from "../utils/tasks"
import ProjectList from "../components/ProjectList"
import ProjectDetail from "../components/ProjectDetail.tsx"

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Веб-приложение" },
    { id: "2", name: "Мобильное приложение" },
    { id: "3", name: "Дизайн система" },
  ])

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "1",
      title: "Создать макет",
      description: "Разработать дизайн главной страницы",
      assignee: "Иван Иванов",
      status: "done",
      projectId: "1",
    },
    {
      id: "2",
      title: "Реализовать API",
      description: "Разработать REST API для backend",
      assignee: "Петр Петров",
      status: "in_progress",
      projectId: "1",
    },
    {
      id: "3",
      title: "Написать тесты",
      description: "Покрыть код unit-тестами",
      assignee: "Мария Сидорова",
      status: "todo",
      projectId: "1",
    },
    {
      id: "4",
      title: "Настроить CI/CD",
      description: "Настроить автоматический деплой",
      assignee: "Сергей Смирнов",
      status: "todo",
      projectId: "2",
    },
  ])

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleAddTask = (task: TaskItem) => {
    setTasks([...tasks, task])
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <section className="container mx-auto px-4">
      {selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          tasks={tasks}
          onAddTask={handleAddTask}
          onBack={() => setSelectedProjectId(null)}
        />
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Проекты</h2>
          <ProjectList
            projects={projects}
            tasks={tasks}
            onProjectClick={setSelectedProjectId}
          />
        </div>
      )}
    </section>
  )
}
