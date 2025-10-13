export type TaskStatus = "todo" | "in_progress" | "done"

export interface TaskItem {
    id: string
    title: string
    description: string
    assignee: string
    status: TaskStatus
    projectId: string
}

export interface Project {
    id: string
    name: string
}

export function filterTasksByStatus(tasks: TaskItem[], status: TaskStatus): TaskItem[] {
    return tasks.filter((t) => t.status === status)
}

export function getTaskCountByProject(tasks: TaskItem[], projectId: string): number {
    return tasks.filter((t) => t.projectId === projectId).length
}
