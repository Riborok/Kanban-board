let projects = [
    { id: "1", name: "Веб-приложение" },
    { id: "2", name: "Мобильное приложение" },
    { id: "3", name: "Дизайн система" },
]

let tasks = [
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
]

export const getProjects = () => projects

export const getProjectById = (id) => projects.find((p) => p.id === id)

export const createProject = (project) => {
    projects.push(project)
    return project
}

export const updateProject = (id, updates) => {
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) return null
    projects[index] = { ...projects[index], ...updates }
    return projects[index]
}

export const deleteProject = (id) => {
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) return false
    projects.splice(index, 1)
    tasks = tasks.filter((t) => t.projectId !== id)
    return true
}

export const getTasks = () => tasks

export const getTaskById = (id) => tasks.find((t) => t.id === id)

export const getTasksByProjectId = (projectId) => tasks.filter((t) => t.projectId === projectId)

export const createTask = (task) => {
    tasks.push(task)
    return task
}

export const updateTask = (id, updates) => {
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return null
    tasks[index] = { ...tasks[index], ...updates }
    return tasks[index]
}

export const deleteTask = (id) => {
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return false
    tasks.splice(index, 1)
    return true
}
