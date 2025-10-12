export type TaskStatus = "todo" | "in_progress" | "done"

export interface TaskItem {
  id: string
  title: string
  status: TaskStatus
}

export function filterTasksByStatus(tasks: TaskItem[], status: TaskStatus): TaskItem[] {
  return tasks.filter((t) => t.status === status)
}
