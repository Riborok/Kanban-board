export type TaskStatus = "todo" | "in_progress" | "done"

export interface User {
    id: string
    login: string
    name: string
    role: string
    projects?: string[]
    tasks?: string[]
}

export interface TaskItem {
    id: string
    title: string
    description: string
    user: User
    status: TaskStatus
    projectId: string
}

export interface Project {
    id: string
    name: string
    description?: string
    users?: User[]
}

export function filterTasksByStatus(tasks: TaskItem[], status: TaskStatus): TaskItem[] {
    return tasks.filter((t) => t.status === status)
}

export function getTaskCountByProject(tasks: TaskItem[], projectId: string): number {
    return tasks.filter((t) => t.projectId === projectId).length
}

export function getUserId(user: User): string {
    return user.id
}

export function getUserName(user: User): string {
    return user.name || user.login || user.id
}
