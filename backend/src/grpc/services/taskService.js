import Task from '../../models/Task.js';
import User from '../../models/User.js';
import Project from '../../models/Project.js';
import { verifyToken } from './authService.js';

const mapTaskUser = (user) => {
    if (!user) return null;
    return {
        id: user._id?.toString() || '',
        login: user.login || '',
        role: user.role || ''
    };
};

const mapTaskProject = (project) => {
    if (!project) return null;
    return {
        id: project._id?.toString() || '',
        name: project.name || ''
    };
};

const mapAttachment = (att) => ({
    fileName: att.fileName,
    fileData: att.fileData,
    mimeType: att.mimeType,
    fileSize: att.fileSize
});

const mapTask = (task) => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description || '',
    status: task.status,
    user: mapTaskUser(task.user),
    project: mapTaskProject(task.projectId),
    attachments: task.attachments ? task.attachments.map(mapAttachment) : [],
    createdAt: task.createdAt?.toISOString() || '',
    updatedAt: task.updatedAt?.toISOString() || ''
});

const taskService = {
    GetTasks: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            const { projectId, status } = call.request;
            const filter = {};

            if (projectId) filter.projectId = projectId;
            if (status) filter.status = status;

            if (decoded.role !== 'admin') {
                filter.user = decoded.userId;
            }

            const tasks = await Task.find(filter)
                .populate('projectId', 'name')
                .populate('user', 'login role');

            callback(null, { tasks: tasks.map(mapTask) });
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    GetTask: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            const { id } = call.request;
            const task = await Task.findById(id)
                .populate('projectId', 'name')
                .populate('user', 'login role');

            if (!task) {
                return callback({
                    code: 5,
                    message: 'Задача не найдена'
                });
            }

            callback(null, mapTask(task));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    CreateTask: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            if (decoded.role !== 'admin') {
                return callback({
                    code: 7,
                    message: 'Доступ запрещен. Только администраторы могут создавать задачи.'
                });
            }

            const { title, description, userLogin, status, projectId, attachments } = call.request;

            if (!title) {
                return callback({
                    code: 3,
                    message: 'Название задачи обязательно'
                });
            }

            if (!userLogin) {
                return callback({
                    code: 3,
                    message: 'Логин пользователя обязателен'
                });
            }

            if (!projectId) {
                return callback({
                    code: 3,
                    message: 'ID проекта обязателен'
                });
            }

            const project = await Project.findById(projectId);
            if (!project) {
                return callback({
                    code: 5,
                    message: 'Проект не найден'
                });
            }

            const userDoc = await User.findOne({ login: userLogin });
            if (!userDoc) {
                return callback({
                    code: 5,
                    message: `Пользователь с логином "${userLogin}" не найден`
                });
            }

            const validStatuses = ['todo', 'in_progress', 'done'];
            const taskStatus = status || 'todo';
            if (!validStatuses.includes(taskStatus)) {
                return callback({
                    code: 3,
                    message: 'Недопустимый статус задачи'
                });
            }

            const newTask = new Task({
                title,
                description: description || '',
                user: userDoc._id,
                status: taskStatus,
                projectId,
                attachments: attachments || []
            });

            const task = await newTask.save();

            await User.findByIdAndUpdate(userDoc._id, {
                $addToSet: { tasks: task._id }
            });

            await task.populate('user', 'login role');
            await task.populate('projectId', 'name');
            
            callback(null, mapTask(task));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    UpdateTask: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            const { id, title, description, userId, status, projectId, attachments } = call.request;

            const task = await Task.findById(id);
            if (!task) {
                return callback({
                    code: 5,
                    message: 'Задача не найдена'
                });
            }

            if (decoded.role !== 'admin' && task.user.toString() !== decoded.userId.toString()) {
                return callback({
                    code: 7,
                    message: 'Доступ запрещен. Вы можете обновлять только свои задачи.'
                });
            }

            const updates = {};

            if (decoded.role === 'admin') {
                if (title) updates.title = title;
                if (description !== undefined && description !== '') updates.description = description;

                if (projectId) {
                    const project = await Project.findById(projectId);
                    if (!project) {
                        return callback({
                            code: 5,
                            message: 'Проект не найден'
                        });
                    }
                    updates.projectId = projectId;
                }

                if (userId) {
                    const userDoc = await User.findById(userId);
                    if (!userDoc) {
                        return callback({
                            code: 5,
                            message: 'Пользователь не найден'
                        });
                    }

                    if (task.user.toString() !== userId) {
                        await User.findByIdAndUpdate(task.user, {
                            $pull: { tasks: id }
                        });
                        await User.findByIdAndUpdate(userId, {
                            $addToSet: { tasks: id }
                        });
                    }
                    updates.user = userId;
                }
            }

            if (status) {
                const validStatuses = ['todo', 'in_progress', 'done'];
                if (!validStatuses.includes(status)) {
                    return callback({
                        code: 3,
                        message: 'Недопустимый статус'
                    });
                }
                updates.status = status;
            }

            if (attachments !== undefined && attachments.length > 0) {
                updates.attachments = attachments;
            }

            const updatedTask = await Task.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).populate('projectId', 'name').populate('user', 'login role');

            callback(null, mapTask(updatedTask));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    DeleteTask: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            if (decoded.role !== 'admin') {
                return callback({
                    code: 7,
                    message: 'Доступ запрещен. Только администраторы могут удалять задачи.'
                });
            }

            const { id } = call.request;
            const task = await Task.findById(id);
            
            if (!task) {
                return callback({
                    code: 5,
                    message: 'Задача не найдена'
                });
            }

            await User.findByIdAndUpdate(task.user, {
                $pull: { tasks: id }
            });

            await Task.findByIdAndDelete(id);

            callback(null, { success: true, message: 'Задача успешно удалена' });
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    }
};

export default taskService;

