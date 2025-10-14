import express from "express"
import Project from "../models/Project.js"
import User from "../models/User.js"
import { mapProject, mapMany } from "../utils/mappers.js"

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().populate('users', 'login name role');
        res.json(mapMany(projects, mapProject))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post("/", async (req, res) => {
    try {
        const { name, description, users } = req.body

        if (!name) {
            return res.status(400).json({ error: "Project name is required" })
        }

        const newProject = new Project({
            name,
            description: description || '',
            users: users || []
        })

        const project = await newProject.save()

        if (users && users.length > 0) {
            await User.updateMany(
                { _id: { $in: users } },
                { $addToSet: { projects: project._id } }
            )
        }

        await project.populate('users', 'login name role')
        res.status(201).json(mapProject(project))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.put("/:id", async (req, res) => {
    try {
        const { name, description, users } = req.body

        const updates = {}
        if (name) updates.name = name
        if (description !== undefined) updates.description = description
        if (users !== undefined) {
            const oldProject = await Project.findById(req.params.id)
            if (oldProject) {
                await User.updateMany(
                    { _id: { $in: oldProject.users } },
                    { $pull: { projects: req.params.id } }
                )
                await User.updateMany(
                    { _id: { $in: users } },
                    { $addToSet: { projects: req.params.id } }
                )
            }
            updates.users = users
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('users', 'login name role');

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" })
        }

        res.json(mapProject(updatedProject))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id)
        if (!project) {
            return res.status(404).json({ error: "Project not found" })
        }

        const Task = (await import("../models/Task.js")).default
        const tasks = await Task.find({ projectId: req.params.id })
        const taskIds = tasks.map(t => t._id)

        await Task.deleteMany({ projectId: req.params.id })

        await User.updateMany(
            { projects: req.params.id },
            { $pull: { projects: req.params.id } }
        )
        await User.updateMany(
            { tasks: { $in: taskIds } },
            { $pull: { tasks: { $in: taskIds } } }
        )

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
