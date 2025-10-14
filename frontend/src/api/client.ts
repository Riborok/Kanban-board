import { Project, TaskItem } from "../utils/tasks"

const API_BASE_URL = import.meta.env.VITE_API_URL

export const projectsApi = {
    getAll: async (): Promise<Project[]> => {
        const response = await fetch(`${API_BASE_URL}/projects`)
        if (!response.ok) throw new Error("Failed to fetch projects")
        return response.json()
    },

    create: async (name: string, description?: string): Promise<Project> => {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        })
        if (!response.ok) throw new Error("Failed to create project")
        return response.json()
    },

    update: async (id: string, name: string, description?: string): Promise<Project> => {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        })
        if (!response.ok) throw new Error("Failed to update project")
        return response.json()
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
            method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete project")
    },
}

export const tasksApi = {
    getAll: async (projectId?: string, status?: string): Promise<TaskItem[]> => {
        const params = new URLSearchParams()
        if (projectId) params.append("projectId", projectId)
        if (status) params.append("status", status)

        const url = `${API_BASE_URL}/tasks${params.toString() ? `?${params.toString()}` : ""}`
        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch tasks")
        return response.json()
    },

    create: async (task: { title: string; description: string; user: string; status: string; projectId: string }): Promise<TaskItem> => {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        })
        if (!response.ok) throw new Error("Failed to create task")
        return response.json()
    },

    update: async (id: string, updates: { title?: string; description?: string; user?: string; status?: string; projectId?: string }): Promise<TaskItem> => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        })
        if (!response.ok) throw new Error("Failed to update task")
        return response.json()
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete task")
    },
}
