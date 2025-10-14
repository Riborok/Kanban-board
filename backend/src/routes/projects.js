import express from "express"
import { v4 as uuidv4 } from "uuid"
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
} from "../data/storage.js"

const router = express.Router()

router.get("/", (req, res) => {
    try {
        const projects = getProjects()
        res.json(projects)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post("/", (req, res) => {
    try {
        const { name } = req.body

        if (!name) {
            return res.status(400).json({ error: "Project name is required" })
        }

        const newProject = {
            id: uuidv4(),
            name: name,
        }

        const project = createProject(newProject)
        res.status(201).json(project)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.put("/:id", (req, res) => {
    try {
        const { name } = req.body

        if (!name) {
            return res.status(400).json({ error: "Project name is required" })
        }

        const updatedProject = updateProject(req.params.id, { name: name })
        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" })
        }

        res.json(updatedProject)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.delete("/:id", (req, res) => {
    try {
        const success = deleteProject(req.params.id)
        if (!success) {
            return res.status(404).json({ error: "Project not found" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router

