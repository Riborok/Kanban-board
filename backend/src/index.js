import dotenv from 'dotenv';
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import projectsRouter from "./routes/projects.js"
import tasksRouter from "./routes/tasks.js"

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URLS = process.env.CLIENT_URLS

app.use(cors({
    origin: CLIENT_URLS,
    credentials: true,
}));
app.use(bodyParser.json())

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use("/api/projects", projectsRouter)
app.use("/api/tasks", tasksRouter)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log(`Allowed client URLs: ${CLIENT_URLS}`)
})
