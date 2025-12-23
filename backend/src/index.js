import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { ApolloServer } from "apollo-server-express"
import jwt from "jsonwebtoken"
import { connectDB } from "./config/database.js"
import typeDefs from "./graphql/typeDefs.js"
import resolvers from "./graphql/resolvers.js"
import User from "./models/User.js"

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
const PORT = process.env.PORT || 5000
const CLIENT_URLS = process.env.CLIENT_URLS || 'http://localhost:5173'

const app = express()

app.use(cors({
    origin: CLIENT_URLS,
    credentials: true,
}));
app.use(bodyParser.json())

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const getUser = async (token) => {
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return null;

        return {
            userId: user._id,
            login: user.login,
            role: user.role
        };
    } catch (error) {
        return null;
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const token = req.headers.authorization?.split(' ')[1] || '';
        const user = await getUser(token);
        return { user };
    }
});

connectDB().then(async () => {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
        console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`)
        console.log(`Allowed client URLs: ${CLIENT_URLS}`)
    })
})
