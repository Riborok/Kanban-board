import { Project, TaskItem, Attachment, User } from "../utils/tasks"
import { grpcClient } from "../grpc/client"

export const tokenStorage = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    setUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await grpcClient.auth.refresh(refreshToken);
        tokenStorage.setTokens(response.accessToken, refreshToken);
        if (response.user) tokenStorage.setUser(response.user);
        return response.accessToken;
    } catch (error) {
        tokenStorage.clearTokens();
        return null;
    }
};

export const authApi = {
    register: async (login: string, password: string, role?: string) => {
        return await grpcClient.auth.register(login, password, role);
    },

    login: async (login: string, password: string) => {
        const response = await grpcClient.auth.login(login, password);
        tokenStorage.setTokens(response.accessToken, response.refreshToken);
        tokenStorage.setUser(response.user);
        return {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
            message: response.message || ''
        };
    },

    logout: () => {
        tokenStorage.clearTokens();
    },

    getCurrentUser: async () => {
        return await grpcClient.auth.getMe();
    },

    getUsers: async () => {
        return await grpcClient.auth.getUsers();
    }
};

export const projectsApi = {
    getAll: async (): Promise<Project[]> => {
        return await grpcClient.project.getAll();
    },

    create: async (name: string, description?: string, userLogins?: string[]): Promise<Project> => {
        return await grpcClient.project.create(name, description, userLogins);
    },

    update: async (id: string, name: string, description?: string): Promise<Project> => {
        return await grpcClient.project.update(id, name, description);
    },

    delete: async (id: string): Promise<void> => {
        return await grpcClient.project.delete(id);
    },
}

export const tasksApi = {
    getAll: async (projectId?: string, status?: string): Promise<TaskItem[]> => {
        return await grpcClient.task.getAll(projectId, status);
    },

    create: async (task: { title: string; description: string; user: string; status: string; projectId: string; attachments?: Attachment[] }): Promise<TaskItem> => {
        return await grpcClient.task.create(task);
    },

    update: async (id: string, updates: { title?: string; description?: string; user?: string; status?: string; projectId?: string; attachments?: Attachment[] }): Promise<TaskItem> => {
        return await grpcClient.task.update(id, updates);
    },

    delete: async (id: string): Promise<void> => {
        return await grpcClient.task.delete(id);
    },
}
