import express from 'express';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRPC_SERVER_URL = process.env.GRPC_SERVER_URL || 'localhost:50051';

const PROTO_OPTIONS = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

const loadProto = (protoFile) => {
    const protoPath = path.join(__dirname, '../grpc/protos', protoFile);
    const packageDefinition = protoLoader.loadSync(protoPath, PROTO_OPTIONS);
    return grpc.loadPackageDefinition(packageDefinition);
};

const authProto = loadProto('auth.proto');
const projectProto = loadProto('project.proto');
const taskProto = loadProto('task.proto');

const router = express.Router();

// Ленивая инициализация gRPC клиентов
let authClient = null;
let projectClient = null;
let taskClient = null;

const getAuthClient = () => {
    if (!authClient) {
        authClient = new authProto.auth.AuthService(
            GRPC_SERVER_URL,
            grpc.credentials.createInsecure()
        );
    }
    return authClient;
};

const getProjectClient = () => {
    if (!projectClient) {
        projectClient = new projectProto.project.ProjectService(
            GRPC_SERVER_URL,
            grpc.credentials.createInsecure()
        );
    }
    return projectClient;
};

const getTaskClient = () => {
    if (!taskClient) {
        taskClient = new taskProto.task.TaskService(
            GRPC_SERVER_URL,
            grpc.credentials.createInsecure()
        );
    }
    return taskClient;
};

// Вспомогательная функция для выполнения gRPC вызовов
const grpcCall = (client, method, request, metadata = {}) => {
    return new Promise((resolve, reject) => {
        const callMetadata = new grpc.Metadata();
        Object.keys(metadata).forEach(key => {
            callMetadata.add(key, metadata[key]);
        });

        // Добавляем таймаут для запросов
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 5);

        client[method](request, callMetadata, { deadline }, (error, response) => {
            if (error) {
                // Форматируем ошибку для лучшей читаемости
                const errorMessage = error.message || error.toString();
                reject(new Error(errorMessage));
            } else {
                resolve(response);
            }
        });
    });
};

// Auth routes
router.post('/auth.AuthService/Register', async (req, res) => {
    try {
        const request = {
            login: req.body.login,
            password: req.body.password,
            role: req.body.role || ''
        };
        const response = await grpcCall(getAuthClient(), 'Register', request);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth.AuthService/Login', async (req, res) => {
    try {
        const request = {
            login: req.body.login,
            password: req.body.password
        };
        const response = await grpcCall(getAuthClient(), 'Login', request);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth.AuthService/Refresh', async (req, res) => {
    try {
        const request = {
            refreshToken: req.body.refreshToken
        };
        const response = await grpcCall(getAuthClient(), 'Refresh', request);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth.AuthService/GetMe', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {};
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getAuthClient(), 'GetMe', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth.AuthService/GetUsers', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {};
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getAuthClient(), 'GetUsers', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Project routes
router.post('/project.ProjectService/GetProjects', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {};
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getProjectClient(), 'GetProjects', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/project.ProjectService/CreateProject', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {
            name: req.body.name,
            description: req.body.description || '',
            users: req.body.users || []
        };
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getProjectClient(), 'CreateProject', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/project.ProjectService/UpdateProject', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {
            id: req.body.id,
            name: req.body.name || '',
            description: req.body.description || '',
            users: req.body.users || []
        };
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getProjectClient(), 'UpdateProject', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/project.ProjectService/DeleteProject', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {
            id: req.body.id
        };
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getProjectClient(), 'DeleteProject', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Task routes
router.post('/task.TaskService/GetTasks', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {
            projectId: req.body.projectId || '',
            status: req.body.status || ''
        };
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getTaskClient(), 'GetTasks', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/task.TaskService/CreateTask', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {
            title: req.body.title,
            description: req.body.description || '',
            userLogin: req.body.userLogin,
            status: req.body.status,
            projectId: req.body.projectId,
            attachments: req.body.attachments || []
        };
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getTaskClient(), 'CreateTask', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/task.TaskService/UpdateTask', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {
            id: req.body.id,
            title: req.body.title || '',
            description: req.body.description || '',
            userId: req.body.userId || '',
            status: req.body.status || '',
            projectId: req.body.projectId || '',
            attachments: req.body.attachments || []
        };
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getTaskClient(), 'UpdateTask', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/task.TaskService/DeleteTask', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const request = {
            id: req.body.id
        };
        const metadata = token ? { authorization: `Bearer ${token}` } : {};
        const response = await grpcCall(getTaskClient(), 'DeleteTask', request, metadata);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

