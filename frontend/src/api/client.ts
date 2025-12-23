import { Project, TaskItem, Attachment, User } from "../utils/tasks"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
const GRAPHQL_URL = `${API_BASE_URL}/graphql`

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

const getAuthHeaders = () => {
    const token = tokenStorage.getAccessToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{ message: string }>;
}

const graphqlRequest = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query, variables })
    });

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors[0].message;

        // Проверяем нужен ли refresh токена
        if (errorMessage.includes('Не авторизован') || response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                // Повторяем запрос с новым токеном
                const retryResponse = await fetch(GRAPHQL_URL, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ query, variables })
                });
                const retryResult: GraphQLResponse<T> = await retryResponse.json();

                if (retryResult.errors && retryResult.errors.length > 0) {
                    throw new Error(retryResult.errors[0].message);
                }

                return retryResult.data as T;
            } else {
                window.location.href = '/';
                throw new Error('Сессия истекла');
            }
        }

        throw new Error(errorMessage);
    }

    return result.data as T;
};

const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
        const query = `
            mutation Refresh($refreshToken: String!) {
                refresh(refreshToken: $refreshToken) {
                    accessToken
                    user {
                        id
                        login
                        role
                    }
                }
            }
        `;

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { refreshToken } })
        });

        const result = await response.json();

        if (result.errors) {
            tokenStorage.clearTokens();
            return null;
        }

        const data = result.data.refresh;
        tokenStorage.setTokens(data.accessToken, refreshToken);
        if (data.user) tokenStorage.setUser(data.user);
        return data.accessToken;
    } catch (error) {
        tokenStorage.clearTokens();
        return null;
    }
};

export const authApi = {
    register: async (login: string, password: string, role?: string) => {
        const query = `
            mutation Register($login: String!, $password: String!, $role: String) {
                register(login: $login, password: $password, role: $role) {
                    id
                    login
                    role
                }
            }
        `;

        const result = await graphqlRequest<{ register: User }>(query, { login, password, role });
        return { user: result.register };
    },

    login: async (login: string, password: string) => {
        const query = `
            mutation Login($login: String!, $password: String!) {
                login(login: $login, password: $password) {
                    accessToken
                    refreshToken
                    user {
                        id
                        login
                        role
                    }
                    message
                }
            }
        `;

        const result = await graphqlRequest<{ login: { accessToken: string; refreshToken: string; user: User; message: string } }>(query, { login, password });
        const data = result.login;
        tokenStorage.setTokens(data.accessToken, data.refreshToken);
        tokenStorage.setUser(data.user);
        return data;
    },

    logout: () => {
        tokenStorage.clearTokens();
    },

    getCurrentUser: async () => {
        const query = `
            query Me {
                me {
                    id
                    login
                    role
                }
            }
        `;

        const result = await graphqlRequest<{ me: User }>(query);
        return { user: result.me };
    },

    getUsers: async () => {
        const query = `
            query Users {
                users {
                    id
                    login
                    role
                }
            }
        `;

        const result = await graphqlRequest<{ users: User[] }>(query);
        return result.users;
    }
};

export const projectsApi = {
    getAll: async (): Promise<Project[]> => {
        const query = `
            query Projects {
                projects {
                    id
                    name
                    description
                    users {
                        id
                        login
                        role
                    }
                }
            }
        `;

        const result = await graphqlRequest<{ projects: Project[] }>(query);
        return result.projects;
    },

    create: async (name: string, description?: string, userLogins?: string[]): Promise<Project> => {
        const query = `
            mutation CreateProject($name: String!, $description: String, $users: [String]) {
                createProject(name: $name, description: $description, users: $users) {
                    id
                    name
                    description
                    users {
                        id
                        login
                        role
                    }
                }
            }
        `;

        const result = await graphqlRequest<{ createProject: Project }>(query, { name, description, users: userLogins });
        return result.createProject;
    },

    update: async (id: string, name: string, description?: string): Promise<Project> => {
        const query = `
            mutation UpdateProject($id: ID!, $name: String, $description: String) {
                updateProject(id: $id, name: $name, description: $description) {
                    id
                    name
                    description
                    users {
                        id
                        login
                        role
                    }
                }
            }
        `;

        const result = await graphqlRequest<{ updateProject: Project }>(query, { id, name, description });
        return result.updateProject;
    },

    delete: async (id: string): Promise<void> => {
        const query = `
            mutation DeleteProject($id: ID!) {
                deleteProject(id: $id)
            }
        `;

        await graphqlRequest<{ deleteProject: boolean }>(query, { id });
    },
}

export const tasksApi = {
    getAll: async (projectId?: string, status?: string): Promise<TaskItem[]> => {
        const query = `
            query Tasks($projectId: ID, $status: String) {
                tasks(projectId: $projectId, status: $status) {
                    id
                    title
                    description
                    status
                    projectId
                    user {
                        id
                        login
                        role
                    }
                    attachments {
                        fileName
                        fileData
                        mimeType
                        fileSize
                    }
                }
            }
        `;

        const result = await graphqlRequest<{ tasks: TaskItem[] }>(query, { projectId, status });
        return result.tasks;
    },

    create: async (task: { title: string; description: string; user: string; status: string; projectId: string; attachments?: Attachment[] }): Promise<TaskItem> => {
        const query = `
            mutation CreateTask($title: String!, $description: String, $user: String!, $status: String, $projectId: ID!, $attachments: [AttachmentInput]) {
                createTask(title: $title, description: $description, user: $user, status: $status, projectId: $projectId, attachments: $attachments) {
                    id
                    title
                    description
                    status
                    projectId
                    user {
                        id
                        login
                        role
                    }
                    attachments {
                        fileName
                        fileData
                        mimeType
                        fileSize
                    }
                }
            }
        `;

        const result = await graphqlRequest<{ createTask: TaskItem }>(query, task);
        return result.createTask;
    },

    update: async (id: string, updates: { title?: string; description?: string; user?: string; status?: string; projectId?: string; attachments?: Attachment[] }): Promise<TaskItem> => {
        const query = `
            mutation UpdateTask($id: ID!, $title: String, $description: String, $user: ID, $status: String, $projectId: ID, $attachments: [AttachmentInput]) {
                updateTask(id: $id, title: $title, description: $description, user: $user, status: $status, projectId: $projectId, attachments: $attachments) {
                    id
                    title
                    description
                    status
                    projectId
                    user {
                        id
                        login
                        role
                    }
                    attachments {
                        fileName
                        fileData
                        mimeType
                        fileSize
                    }
                }
            }
        `;

        const result = await graphqlRequest<{ updateTask: TaskItem }>(query, { id, ...updates });
        return result.updateTask;
    },

    delete: async (id: string): Promise<void> => {
        const query = `
            mutation DeleteTask($id: ID!) {
                deleteTask(id: $id)
            }
        `;

        await graphqlRequest<{ deleteTask: boolean }>(query, { id });
    },
}
