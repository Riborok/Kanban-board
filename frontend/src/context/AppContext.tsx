import { createContext, useContext, useState, ReactNode } from "react"
import { Project, TaskItem } from "../utils/tasks"

interface AppContextType {
    projects: Project[]
    tasks: TaskItem[]
    addProject: (project: Project) => void
    addTask: (task: TaskItem) => void
    updateTask: (taskId: string, updates: Partial<TaskItem>) => void
    deleteTask: (taskId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
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

    const addProject = (project: Project) => {
        setProjects((prev) => [...prev, project])
    }

    const addTask = (task: TaskItem) => {
        setTasks((prev) => [...prev, task])
    }

    const updateTask = (taskId: string, updates: Partial<TaskItem>) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
        )
    }

    const deleteTask = (taskId: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId))
    }

    return (
        <AppContext.Provider
            value={{
                projects,
                tasks,
                addProject,
                addTask,
                updateTask,
                deleteTask,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider")
    }
    return context
}
