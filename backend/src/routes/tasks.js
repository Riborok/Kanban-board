import express from "express"
import { v4 as uuidv4 } from "uuid"
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getProjectById,
} from "../data/storage.js"

const router = express.Router()

router.get("/", (req, res) => {
    try {
        const { projectId, status } = req.query
        let tasks = getTasks()

        if (projectId) {
            tasks = tasks.filter((t) => t.projectId === projectId)
        }

        if (status) {
            tasks = tasks.filter((t) => t.status === status)
        }

        res.json(tasks)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post("/", (req, res) => {
    try {
        const { title, description, assignee, status, projectId } = req.body

        if (!title) {
            return res.status(400).json({ error: "Task title is required" })
        }

        if (!assignee) {
            return res.status(400).json({ error: "Task assignee is required" })
        }

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" })
        }

        const project = getProjectById(projectId)
        if (!project) {
            return res.status(404).json({ error: "Project not found" })
        }

        const validStatuses = ["todo", "in_progress", "done"]
        const taskStatus = status || "todo"
        if (!validStatuses.includes(taskStatus)) {
            return res.status(400).json({ error: "Invalid status" })
        }

        const newTask = {
            id: uuidv4(),
            title: title,
            description: description || "",
            assignee: assignee,
            status: taskStatus,
            projectId: projectId,
        }

        const task = createTask(newTask)
        res.status(201).json(task)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.put("/:id", (req, res) => {
    try {
        const { title, description, assignee, status, projectId } = req.body

        if (status) {
            const validStatuses = ["todo", "in_progress", "done"]
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" })
            }
        }

        if (projectId) {
            const project = getProjectById(projectId)
            if (!project) {
                return res.status(404).json({ error: "Project not found" })
            }
        }

        const updates = {}
        if (title) updates.title = title
        if (description) updates.description = description
        if (assignee) updates.assignee = assignee
        if (status) updates.status = status
        if (projectId) updates.projectId = projectId

        const updatedTask = updateTask(req.params.id, updates)
        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" })
        }

        res.json(updatedTask)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.delete("/:id", (req, res) => {
    try {
        const success = deleteTask(req.params.id)
        if (!success) {
            return res.status(404).json({ error: "Task not found" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
