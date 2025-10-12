import { TaskItem } from "../utils/tasks"

interface TaskCardProps {
  task: TaskItem
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-3 mb-3 hover:border-violet-500">
      <h4 className="font-semibold mb-2 text-white">{task.title}</h4>
      <p className="text-sm text-gray-300 mb-2">{task.description}</p>
      <div className="flex items-center">
        <span className="text-xs text-gray-400">Исполнитель:</span>
        <span className="text-xs ml-2 font-medium text-violet-400">{task.assignee}</span>
      </div>
    </div>
  )
}
