import Project from '../../models/Project.js';
import User from '../../models/User.js';
import Task from '../../models/Task.js';
import { verifyToken } from './authService.js';

const mapProjectUser = (user) => ({
    id: user._id.toString(),
    login: user.login,
    role: user.role
});

const mapProject = (project) => ({
    id: project._id.toString(),
    name: project.name,
    description: project.description || '',
    users: project.users ? project.users.map(mapProjectUser) : [],
    createdAt: project.createdAt?.toISOString() || '',
    updatedAt: project.updatedAt?.toISOString() || ''
});

const projectService = {
    GetProjects: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            let projects;
            if (decoded.role === 'admin') {
                projects = await Project.find().populate('users', 'login role');
            } else {
                projects = await Project.find({ users: decoded.userId }).populate('users', 'login role');
            }

            callback(null, { projects: projects.map(mapProject) });
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    GetProject: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            const { id } = call.request;
            const project = await Project.findById(id).populate('users', 'login role');
            
            if (!project) {
                return callback({
                    code: 5,
                    message: 'Проект не найден'
                });
            }

            callback(null, mapProject(project));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    CreateProject: async (call, callback) => {
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
                    code: 7, // PERMISSION_DENIED
                    message: 'Доступ запрещен. Только администраторы могут создавать проекты.'
                });
            }

            const { name, description, users } = call.request;

            if (!name) {
                return callback({
                    code: 3,
                    message: 'Название проекта обязательно'
                });
            }

            let userIds = [];
            if (users && users.length > 0) {
                const dbUsers = await User.find({ login: { $in: users } });
                if (dbUsers.length !== users.length) {
                    const foundLogins = dbUsers.map(u => u.login);
                    const notFoundLogins = users.filter(login => !foundLogins.includes(login));
                    return callback({
                        code: 5,
                        message: `Пользователи не найдены: ${notFoundLogins.join(', ')}`
                    });
                }
                userIds = dbUsers.map(u => u._id);
            }

            const newProject = new Project({
                name,
                description: description || '',
                users: userIds
            });

            const project = await newProject.save();

            if (userIds.length > 0) {
                await User.updateMany(
                    { _id: { $in: userIds } },
                    { $addToSet: { projects: project._id } }
                );
            }

            await project.populate('users', 'login role');
            callback(null, mapProject(project));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    UpdateProject: async (call, callback) => {
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
                    message: 'Доступ запрещен. Только администраторы могут обновлять проекты.'
                });
            }

            const { id, name, description, users } = call.request;
            const updates = {};
            
            if (name) updates.name = name;
            if (description !== undefined && description !== '') updates.description = description;

            if (users && users.length > 0) {
                const oldProject = await Project.findById(id);
                if (oldProject) {
                    await User.updateMany(
                        { _id: { $in: oldProject.users } },
                        { $pull: { projects: id } }
                    );
                    
                    const dbUsers = await User.find({ login: { $in: users } });
                    const userIds = dbUsers.map(u => u._id);
                    
                    await User.updateMany(
                        { _id: { $in: userIds } },
                        { $addToSet: { projects: id } }
                    );
                    updates.users = userIds;
                }
            }

            const updatedProject = await Project.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).populate('users', 'login role');

            if (!updatedProject) {
                return callback({
                    code: 5,
                    message: 'Проект не найден'
                });
            }

            callback(null, mapProject(updatedProject));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    DeleteProject: async (call, callback) => {
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
                    message: 'Доступ запрещен. Только администраторы могут удалять проекты.'
                });
            }

            const { id } = call.request;
            const project = await Project.findByIdAndDelete(id);
            
            if (!project) {
                return callback({
                    code: 5,
                    message: 'Проект не найден'
                });
            }

            const tasks = await Task.find({ projectId: id });
            const taskIds = tasks.map(t => t._id);

            await Task.deleteMany({ projectId: id });
            await User.updateMany(
                { projects: id },
                { $pull: { projects: id } }
            );
            await User.updateMany(
                { tasks: { $in: taskIds } },
                { $pull: { tasks: { $in: taskIds } } }
            );

            callback(null, { success: true, message: 'Проект успешно удалён' });
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    }
};

export default projectService;

