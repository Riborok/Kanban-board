import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { mapUser, mapProject, mapTask, mapMany } from '../utils/mappers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const resolvers = {
    Query: {
        // Auth queries
        me: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }
            const dbUser = await User.findById(user.userId).select('-password');
            if (!dbUser) {
                throw new Error('Пользователь не найден');
            }
            return mapUser(dbUser);
        },

        users: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }
            const users = await User.find().select('-password');
            return mapMany(users, mapUser);
        },

        // Project queries
        projects: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            let projects;
            if (user.role === 'admin') {
                projects = await Project.find().populate('users', 'login role');
            } else {
                projects = await Project.find({ users: user.userId }).populate('users', 'login role');
            }

            return mapMany(projects, mapProject);
        },

        project: async (_, { id }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            const project = await Project.findById(id).populate('users', 'login role');
            if (!project) {
                throw new Error('Проект не найден');
            }

            return mapProject(project);
        },

        // Task queries
        tasks: async (_, { projectId, status }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            const filter = {};

            if (projectId) {
                filter.projectId = projectId;
            }

            if (status) {
                filter.status = status;
            }

            if (user.role !== 'admin') {
                filter.user = user.userId;
            }

            const tasks = await Task.find(filter)
                .populate('projectId', 'name')
                .populate('user', 'login role');

            return mapMany(tasks, mapTask);
        },

        task: async (_, { id }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            const task = await Task.findById(id)
                .populate('projectId', 'name')
                .populate('user', 'login role');

            if (!task) {
                throw new Error('Задача не найдена');
            }

            return mapTask(task);
        },
    },

    Mutation: {
        // Auth mutations
        register: async (_, { login, password, role }) => {
            if (!login || !password) {
                throw new Error('Логин и пароль обязательны');
            }

            const existingUser = await User.findOne({ login });
            if (existingUser) {
                throw new Error('Пользователь с таким логином уже существует');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User({
                login,
                password: hashedPassword,
                role: role || 'user'
            });

            await user.save();

            return mapUser(user);
        },

        login: async (_, { login, password }) => {
            if (!login || !password) {
                throw new Error('Логин и пароль обязательны');
            }

            const user = await User.findOne({ login });
            if (!user) {
                throw new Error('Неверный логин или пароль');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Неверный логин или пароль');
            }

            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    login: user.login,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            const refreshToken = jwt.sign(
                {
                    userId: user._id,
                    login: user.login
                },
                JWT_REFRESH_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRY }
            );

            return {
                accessToken,
                refreshToken,
                user: mapUser(user),
                message: 'Вход выполнен успешно'
            };
        },

        refresh: async (_, { refreshToken }) => {
            if (!refreshToken) {
                throw new Error('Refresh токен не предоставлен');
            }

            try {
                const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
                const user = await User.findById(decoded.userId);

                if (!user) {
                    throw new Error('Пользователь не найден');
                }

                const accessToken = jwt.sign(
                    {
                        userId: user._id,
                        login: user.login,
                        role: user.role
                    },
                    JWT_SECRET,
                    { expiresIn: ACCESS_TOKEN_EXPIRY }
                );

                return {
                    accessToken,
                    user: mapUser(user)
                };
            } catch (error) {
                throw new Error('Невалидный или истёкший refresh токен');
            }
        },

        // Project mutations
        createProject: async (_, { name, description, users }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            if (user.role !== 'admin') {
                throw new Error('Доступ запрещен. Только администраторы могут создавать проекты.');
            }

            if (!name) {
                throw new Error('Название проекта обязательно');
            }

            let userIds = [];

            if (users && users.length > 0) {
                const dbUsers = await User.find({ login: { $in: users } });

                if (dbUsers.length !== users.length) {
                    const foundLogins = dbUsers.map(u => u.login);
                    const notFoundLogins = users.filter(login => !foundLogins.includes(login));
                    throw new Error(`Пользователи не найдены: ${notFoundLogins.join(', ')}`);
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
            return mapProject(project);
        },

        updateProject: async (_, { id, name, description, users }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            if (user.role !== 'admin') {
                throw new Error('Доступ запрещен. Только администраторы могут обновлять проекты.');
            }

            const updates = {};
            if (name) updates.name = name;
            if (description !== undefined) updates.description = description;

            if (users !== undefined) {
                const oldProject = await Project.findById(id);
                if (oldProject) {
                    await User.updateMany(
                        { _id: { $in: oldProject.users } },
                        { $pull: { projects: id } }
                    );
                    await User.updateMany(
                        { _id: { $in: users } },
                        { $addToSet: { projects: id } }
                    );
                }
                updates.users = users;
            }

            const updatedProject = await Project.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).populate('users', 'login role');

            if (!updatedProject) {
                throw new Error('Проект не найден');
            }

            return mapProject(updatedProject);
        },

        deleteProject: async (_, { id }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            if (user.role !== 'admin') {
                throw new Error('Доступ запрещен. Только администраторы могут удалять проекты.');
            }

            const project = await Project.findByIdAndDelete(id);
            if (!project) {
                throw new Error('Проект не найден');
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

            return true;
        },

        // Task mutations
        createTask: async (_, { title, description, user: userLogin, status, projectId, attachments }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            if (user.role !== 'admin') {
                throw new Error('Доступ запрещен. Только администраторы могут создавать задачи.');
            }

            if (!title) {
                throw new Error('Название задачи обязательно');
            }

            if (!userLogin) {
                throw new Error('Логин пользователя обязателен');
            }

            if (!projectId) {
                throw new Error('ID проекта обязателен');
            }

            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('Проект не найден');
            }

            const userDoc = await User.findOne({ login: userLogin });
            if (!userDoc) {
                throw new Error(`Пользователь с логином "${userLogin}" не найден`);
            }

            const validStatuses = ['todo', 'in_progress', 'done'];
            const taskStatus = status || 'todo';
            if (!validStatuses.includes(taskStatus)) {
                throw new Error('Недопустимый статус задачи');
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
            return mapTask(task);
        },

        updateTask: async (_, { id, title, description, user: userId, status, projectId, attachments }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Задача не найдена');
            }

            if (user.role !== 'admin' && task.user.toString() !== user.userId.toString()) {
                throw new Error('Доступ запрещен. Вы можете обновлять только свои задачи.');
            }

            const updates = {};

            if (user.role === 'admin') {
                if (title) updates.title = title;
                if (description !== undefined) updates.description = description;

                if (projectId) {
                    const project = await Project.findById(projectId);
                    if (!project) {
                        throw new Error('Проект не найден');
                    }
                    updates.projectId = projectId;
                }

                if (userId) {
                    const userDoc = await User.findById(userId);
                    if (!userDoc) {
                        throw new Error('Пользователь не найден');
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
                    throw new Error('Недопустимый статус');
                }
                updates.status = status;
            }

            if (attachments !== undefined) {
                updates.attachments = attachments;
            }

            const updatedTask = await Task.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).populate('projectId', 'name').populate('user', 'login role');

            return mapTask(updatedTask);
        },

        deleteTask: async (_, { id }, { user }) => {
            if (!user) {
                throw new Error('Не авторизован');
            }

            if (user.role !== 'admin') {
                throw new Error('Доступ запрещен. Только администраторы могут удалять задачи.');
            }

            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Задача не найдена');
            }

            await User.findByIdAndUpdate(task.user, {
                $pull: { tasks: id }
            });

            await Task.findByIdAndDelete(id);

            return true;
        },
    },
};

export default resolvers;

