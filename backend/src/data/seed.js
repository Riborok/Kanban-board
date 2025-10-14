import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/spp_db';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Project.deleteMany({});
        await Task.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        const users = await User.create([
            {
                login: 'admin',
                password: 'admin123',
                name: 'Администратор',
                role: 'admin',
                projects: [],
                tasks: []
            },
            {
                login: 'ivan_ivanov',
                password: 'user123',
                name: 'Иван Иванов',
                role: 'user',
                projects: [],
                tasks: []
            },
            {
                login: 'petr_petrov',
                password: 'user123',
                name: 'Петр Петров',
                role: 'user',
                projects: [],
                tasks: []
            },
            {
                login: 'maria_sidorova',
                password: 'user123',
                name: 'Мария Сидорова',
                role: 'user',
                projects: [],
                tasks: []
            }
        ]);
        console.log('Users created');

        const projects = await Project.create([
            {
                name: 'Веб-приложение',
                description: 'Разработка корпоративного веб-приложения',
                users: [users[1]._id, users[2]._id]
            },
            {
                name: 'Мобильное приложение',
                description: 'Разработка мобильного приложения для iOS и Android',
                users: [users[2]._id, users[3]._id]
            },
            {
                name: 'Дизайн система',
                description: 'Создание единой дизайн-системы',
                users: [users[1]._id, users[3]._id]
            }
        ]);
        console.log('Projects created');

        const tasks = await Task.create([
            {
                title: 'Создать макет',
                description: 'Разработать дизайн главной страницы',
                user: users[1]._id,
                status: 'done',
                projectId: projects[0]._id
            },
            {
                title: 'Реализовать API',
                description: 'Разработать REST API для backend',
                user: users[2]._id,
                status: 'in_progress',
                projectId: projects[0]._id
            },
            {
                title: 'Написать тесты',
                description: 'Покрыть код unit-тестами',
                user: users[3]._id,
                status: 'todo',
                projectId: projects[1]._id
            },
            {
                title: 'Настроить CI/CD',
                description: 'Настроить автоматический деплой',
                user: users[2]._id,
                status: 'todo',
                projectId: projects[1]._id
            }
        ]);
        console.log('Tasks created');

        await User.findByIdAndUpdate(users[1]._id, {
            projects: [projects[0]._id, projects[2]._id],
            tasks: [tasks[0]._id]
        });
        await User.findByIdAndUpdate(users[2]._id, {
            projects: [projects[0]._id, projects[1]._id],
            tasks: [tasks[1]._id, tasks[3]._id]
        });
        await User.findByIdAndUpdate(users[3]._id, {
            projects: [projects[1]._id, projects[2]._id],
            tasks: [tasks[2]._id]
        });
        console.log('User relations updated');

        console.log('Seed data inserted successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
