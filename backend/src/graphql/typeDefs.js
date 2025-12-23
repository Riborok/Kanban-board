const typeDefs = `#graphql
    type Attachment {
        fileName: String!
        fileData: String!
        mimeType: String!
        fileSize: Int!
    }

    input AttachmentInput {
        fileName: String!
        fileData: String!
        mimeType: String!
        fileSize: Int!
    }

    type User {
        id: ID!
        login: String!
        role: String!
        projects: [String]
        tasks: [String]
    }

    type AuthPayload {
        accessToken: String!
        refreshToken: String!
        user: User!
        message: String
    }

    type RefreshPayload {
        accessToken: String!
        user: User!
    }

    type Project {
        id: ID!
        name: String!
        description: String
        users: [User]
        createdAt: String
        updatedAt: String
    }

    type Task {
        id: ID!
        title: String!
        description: String
        status: String!
        user: User
        projectId: String!
        attachments: [Attachment]
        createdAt: String
        updatedAt: String
    }

    type Query {
        # Auth queries
        me: User
        users: [User]

        # Project queries
        projects: [Project]
        project(id: ID!): Project

        # Task queries
        tasks(projectId: ID, status: String): [Task]
        task(id: ID!): Task
    }

    type Mutation {
        # Auth mutations
        register(login: String!, password: String!, role: String): User
        login(login: String!, password: String!): AuthPayload
        refresh(refreshToken: String!): RefreshPayload

        # Project mutations
        createProject(name: String!, description: String, users: [String]): Project
        updateProject(id: ID!, name: String, description: String, users: [ID]): Project
        deleteProject(id: ID!): Boolean

        # Task mutations
        createTask(
            title: String!
            description: String
            user: String!
            status: String
            projectId: ID!
            attachments: [AttachmentInput]
        ): Task
        updateTask(
            id: ID!
            title: String
            description: String
            user: ID
            status: String
            projectId: ID
            attachments: [AttachmentInput]
        ): Task
        deleteTask(id: ID!): Boolean
    }
`;

export default typeDefs;

