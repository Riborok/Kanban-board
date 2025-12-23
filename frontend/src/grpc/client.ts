import { grpc } from '@improbable-eng/grpc-web';
import { User, Project, TaskItem, Attachment } from '../utils/tasks';

const GRPC_BASE_URL = import.meta.env.VITE_GRPC_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Для gRPC-Web нужен прокси, но для начала используем прямой подход
// Если не работает, нужно будет настроить прокси на бэкенде

const getMetadata = (token?: string): grpc.Metadata => {
  const metadata = new grpc.Metadata();
  if (token) {
    metadata.set('authorization', `Bearer ${token}`);
  }
  return metadata;
};

// Вспомогательная функция для выполнения gRPC вызовов через HTTP/JSON
// Это упрощенный подход, для полноценного gRPC-Web нужны скомпилированные proto файлы
const grpcCall = <TRequest, TResponse>(
  service: string,
  method: string,
  request: TRequest,
  metadata: grpc.Metadata
): Promise<TResponse> => {
  return new Promise((resolve, reject) => {
    const url = `${GRPC_BASE_URL}/${service}/${method}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Добавляем заголовки из metadata
    const authHeader = metadata.get('authorization');
    if (authHeader && authHeader.length > 0) {
      headers['Authorization'] = authHeader[0];
    }

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })
      .then(async (response) => {
        if (!response.ok) {
          let errorText = '';
          try {
            const errorData = await response.json();
            errorText = errorData.error || errorData.message || response.statusText;
          } catch {
            errorText = await response.text();
          }
          reject(new Error(`HTTP error: ${response.status} - ${errorText}`));
          return;
        }
        const data = await response.json();
        resolve(data as TResponse);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Типы для gRPC сообщений
interface Empty {}

interface RegisterRequest {
  login: string;
  password: string;
  role?: string;
}

interface LoginRequest {
  login: string;
  password: string;
}

interface RefreshRequest {
  refreshToken: string;
}

interface UserResponse {
  id: string;
  login: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
  message?: string;
}

interface RefreshResponse {
  accessToken: string;
  user: UserResponse;
}

interface UsersResponse {
  users: UserResponse[];
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  users?: string[];
}

interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
  users?: string[];
}

interface DeleteProjectRequest {
  id: string;
}

interface ProjectUser {
  id: string;
  login: string;
  role: string;
}

interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  users?: ProjectUser[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectsResponse {
  projects: ProjectResponse[];
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

interface GetTasksRequest {
  projectId?: string;
  status?: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  userLogin: string;
  status: string;
  projectId: string;
  attachments?: Attachment[];
}

interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  userId?: string;
  status?: string;
  projectId?: string;
  attachments?: Attachment[];
}

interface DeleteTaskRequest {
  id: string;
}

interface TaskUser {
  id: string;
  login: string;
  role: string;
}

interface TaskProject {
  id: string;
  name: string;
}

interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: string;
  user?: TaskUser;
  project?: TaskProject;
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string;
}

interface TasksResponse {
  tasks: TaskResponse[];
}

// Преобразование типов
const toUser = (user: UserResponse): User => ({
  id: user.id,
  login: user.login,
  role: user.role,
});

const toProject = (project: ProjectResponse): Project => ({
  id: project.id,
  name: project.name,
  description: project.description,
  users: project.users?.map(toUser),
});

const toTask = (task: TaskResponse): TaskItem => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  status: task.status as TaskItem['status'],
  projectId: task.project?.id || '',
  user: task.user ? toUser(task.user) : null,
  attachments: task.attachments,
});

// Экспорт клиента
export const grpcClient = {
  auth: {
    register: async (login: string, password: string, role?: string): Promise<{ user: User }> => {
      const request: RegisterRequest = { login, password, role };
      const metadata = getMetadata();
      const response = await grpcCall<RegisterRequest, UserResponse>(
        'auth.AuthService',
        'Register',
        request,
        metadata
      );
      return { user: toUser(response) };
    },

    login: async (login: string, password: string): Promise<LoginResponse> => {
      const request: LoginRequest = { login, password };
      const metadata = getMetadata();
      const response = await grpcCall<LoginRequest, LoginResponse>(
        'auth.AuthService',
        'Login',
        request,
        metadata
      );
      return response;
    },

    refresh: async (refreshToken: string): Promise<RefreshResponse> => {
      const request: RefreshRequest = { refreshToken };
      const metadata = getMetadata();
      const response = await grpcCall<RefreshRequest, RefreshResponse>(
        'auth.AuthService',
        'Refresh',
        request,
        metadata
      );
      return response;
    },

    getMe: async (): Promise<{ user: User }> => {
      const request: Empty = {};
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<Empty, UserResponse>(
        'auth.AuthService',
        'GetMe',
        request,
        metadata
      );
      return { user: toUser(response) };
    },

    getUsers: async (): Promise<User[]> => {
      const request: Empty = {};
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<Empty, UsersResponse>(
        'auth.AuthService',
        'GetUsers',
        request,
        metadata
      );
      return response.users.map(toUser);
    },
  },

  project: {
    getAll: async (): Promise<Project[]> => {
      const request: Empty = {};
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<Empty, ProjectsResponse>(
        'project.ProjectService',
        'GetProjects',
        request,
        metadata
      );
      return response.projects.map(toProject);
    },

    create: async (name: string, description?: string, userLogins?: string[]): Promise<Project> => {
      const request: CreateProjectRequest = { name, description, users: userLogins };
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<CreateProjectRequest, ProjectResponse>(
        'project.ProjectService',
        'CreateProject',
        request,
        metadata
      );
      return toProject(response);
    },

    update: async (id: string, name?: string, description?: string): Promise<Project> => {
      const request: UpdateProjectRequest = { id, name, description };
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<UpdateProjectRequest, ProjectResponse>(
        'project.ProjectService',
        'UpdateProject',
        request,
        metadata
      );
      return toProject(response);
    },

    delete: async (id: string): Promise<void> => {
      const request: DeleteProjectRequest = { id };
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      await grpcCall<DeleteProjectRequest, DeleteResponse>(
        'project.ProjectService',
        'DeleteProject',
        request,
        metadata
      );
    },
  },

  task: {
    getAll: async (projectId?: string, status?: string): Promise<TaskItem[]> => {
      const request: GetTasksRequest = { projectId, status };
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<GetTasksRequest, TasksResponse>(
        'task.TaskService',
        'GetTasks',
        request,
        metadata
      );
      return response.tasks.map(toTask);
    },

    create: async (task: {
      title: string;
      description?: string;
      user: string;
      status: string;
      projectId: string;
      attachments?: Attachment[];
    }): Promise<TaskItem> => {
      const request: CreateTaskRequest = {
        title: task.title,
        description: task.description,
        userLogin: task.user, // user - это login пользователя
        status: task.status,
        projectId: task.projectId,
        attachments: task.attachments,
      };
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<CreateTaskRequest, TaskResponse>(
        'task.TaskService',
        'CreateTask',
        request,
        metadata
      );
      return toTask(response);
    },

    update: async (
      id: string,
      updates: {
        title?: string;
        description?: string;
        user?: string;
        status?: string;
        projectId?: string;
        attachments?: Attachment[];
      }
    ): Promise<TaskItem> => {
      const request: UpdateTaskRequest = {
        id,
        title: updates.title,
        description: updates.description,
        userId: updates.user,
        status: updates.status,
        projectId: updates.projectId,
        attachments: updates.attachments,
      };
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      const response = await grpcCall<UpdateTaskRequest, TaskResponse>(
        'task.TaskService',
        'UpdateTask',
        request,
        metadata
      );
      return toTask(response);
    },

    delete: async (id: string): Promise<void> => {
      const request: DeleteTaskRequest = { id };
      const token = localStorage.getItem('accessToken') || undefined;
      const metadata = getMetadata(token);
      await grpcCall<DeleteTaskRequest, TaskDeleteResponse>(
        'task.TaskService',
        'DeleteTask',
        request,
        metadata
      );
    },
  },
};

