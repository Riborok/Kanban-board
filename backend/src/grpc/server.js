import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/database.js';
import authService from './services/authService.js';
import projectService from './services/projectService.js';
import taskService from './services/taskService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRPC_PORT = process.env.GRPC_PORT || 50051;

const PROTO_OPTIONS = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

const loadProto = (protoFile) => {
    const protoPath = path.join(__dirname, 'protos', protoFile);
    const packageDefinition = protoLoader.loadSync(protoPath, PROTO_OPTIONS);
    return grpc.loadPackageDefinition(packageDefinition);
};

const startGrpcServer = async () => {
    // База данных должна быть уже подключена перед вызовом этой функции
    const authProto = loadProto('auth.proto');
    const projectProto = loadProto('project.proto');
    const taskProto = loadProto('task.proto');

    const server = new grpc.Server();

    server.addService(authProto.auth.AuthService.service, authService);
    server.addService(projectProto.project.ProjectService.service, projectService);
    server.addService(taskProto.task.TaskService.service, taskService);

    return new Promise((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:${GRPC_PORT}`,
            grpc.ServerCredentials.createInsecure(),
            (error, port) => {
                if (error) {
                    console.error('Ошибка запуска gRPC сервера:', error);
                    reject(error);
                    return;
                }
                console.log(`gRPC сервер запущен на порту ${port}`);
                resolve(server);
            }
        );
    });
};

export default startGrpcServer;

