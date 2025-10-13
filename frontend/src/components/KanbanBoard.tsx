import { TaskItem, TaskStatus, filterTasksByStatus } from "../utils/tasks"
import TaskCard from "./TaskCard"

interface KanbanBoardProps {
    tasks: TaskItem[]
    onUpdateTask?: (taskId: string, updates: Partial<TaskItem>) => void
    onDeleteTask?: (taskId: string) => void
}

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask }: KanbanBoardProps) {
    const renderColumn = (status: TaskStatus, title: string) => {
        const columnTasks = filterTasksByStatus(tasks, status)

        return (
            <div className="flex-1 min-w-[250px]">
                <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
                    <h3 className="font-semibold mb-4 text-center text-white">
                        {title} <span className="text-violet-400">({columnTasks.length})</span>
                    </h3>
                    <div className="space-y-3">
                        {columnTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onUpdate={onUpdateTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-5 overflow-x-auto">
            {renderColumn("todo", "To Do")}
            {renderColumn("in_progress", "In Progress")}
            {renderColumn("done", "Done")}
        </div>
    )
}
