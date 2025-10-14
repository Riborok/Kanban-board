import express from "express"
import Task from "../models/Task.js"
import Project from "../models/Project.js"
import User from "../models/User.js"
import { mapTask, mapMany } from "../utils/mappers.js"

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const { projectId, status } = req.query
        const filter = {}

        if (projectId) {
            filter.projectId = projectId
        }

        if (status) {
            filter.status = status
        }

        const tasks = await Task.find(filter)
            .populate('projectId', 'name')
            .populate('user', 'login name role');

        res.json(mapMany(tasks, mapTask))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post("/", async (req, res) => {
    try {
        const { title, description, user, status, projectId } = req.body

        if (!title) {
            return res.status(400).json({ error: "Task title is required" })
        }

        if (!user) {
            return res.status(400).json({ error: "Task user is required" })
        }

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" })
        }

        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ error: "Project not found" })
        }

        const userDoc = await User.findById(user)
        if (!userDoc) {
            return res.status(404).json({ error: "User not found" })
        }

        const validStatuses = ["todo", "in_progress", "done"]
        const taskStatus = status || "todo"
        if (!validStatuses.includes(taskStatus)) {
            return res.status(400).json({ error: "Invalid status" })
        }

        const newTask = new Task({
            title,
            description: description || "",
            user,
            status: taskStatus,
            projectId
        })

        const task = await newTask.save()

        await User.findByIdAndUpdate(user, {
            $addToSet: { tasks: task._id }
        })

        await task.populate('user', 'login name role')
        res.status(201).json(mapTask(task))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.put("/:id", async (req, res) => {
    try {
        const { title, description, user, status, projectId } = req.body

        if (status) {
            const validStatuses = ["todo", "in_progress", "done"]
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" })
            }
        }

        if (projectId) {
            const project = await Project.findById(projectId)
            if (!project) {
                return res.status(404).json({ error: "Project not found" })
            }
        }

        if (user) {
            const userDoc = await User.findById(user)
            if (!userDoc) {
                return res.status(404).json({ error: "User not found" })
            }

            const oldTask = await Task.findById(req.params.id)
            if (oldTask && oldTask.user.toString() !== user) {
                await User.findByIdAndUpdate(oldTask.user, {
                    $pull: { tasks: req.params.id }
                })
                await User.findByIdAndUpdate(user, {
                    $addToSet: { tasks: req.params.id }
                })
            }
        }

        const updates = {}
        if (title) updates.title = title
        if (description !== undefined) updates.description = description
        if (user) updates.user = user
        if (status) updates.status = status
        if (projectId) updates.projectId = projectId

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('projectId', 'name').populate('user', 'login name role');

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" })
        }

        res.json(mapTask(updatedTask))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).json({ error: "Task not found" })
        }

        await User.findByIdAndUpdate(task.user, {
            $pull: { tasks: req.params.id }
        })

        await Task.findByIdAndDelete(req.params.id)

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
