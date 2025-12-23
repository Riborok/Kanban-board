import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const mapUser = (user) => ({
    id: user._id.toString(),
    login: user.login,
    role: user.role,
    createdAt: user.createdAt?.toISOString() || '',
    updatedAt: user.updatedAt?.toISOString() || ''
});

const verifyToken = (metadata) => {
    const authHeader = metadata.get('authorization');
    if (!authHeader || authHeader.length === 0) {
        return null;
    }

    const token = authHeader[0].replace('Bearer ', '');
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const authService = {
    Register: async (call, callback) => {
        try {
            const { login, password, role } = call.request;

            if (!login || !password) {
                return callback({
                    code: 3,
                    message: 'Логин и пароль обязательны'
                });
            }

            const existingUser = await User.findOne({ login });
            if (existingUser) {
                return callback({
                    code: 6,
                    message: 'Пользователь с таким логином уже существует'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                login,
                password: hashedPassword,
                role: role || 'user'
            });

            await user.save();
            callback(null, mapUser(user));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    Login: async (call, callback) => {
        try {
            const { login, password } = call.request;

            if (!login || !password) {
                return callback({
                    code: 3,
                    message: 'Логин и пароль обязательны'
                });
            }

            const user = await User.findOne({ login });
            if (!user) {
                return callback({
                    code: 16,
                    message: 'Неверный логин или пароль'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return callback({
                    code: 16,
                    message: 'Неверный логин или пароль'
                });
            }

            const accessToken = jwt.sign(
                { userId: user._id, login: user.login, role: user.role },
                JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            const refreshToken = jwt.sign(
                { userId: user._id, login: user.login },
                JWT_REFRESH_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRY }
            );

            callback(null, {
                accessToken,
                refreshToken,
                user: mapUser(user),
                message: 'Вход выполнен успешно'
            });
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    Refresh: async (call, callback) => {
        try {
            const { refreshToken } = call.request;

            if (!refreshToken) {
                return callback({
                    code: 3,
                    message: 'Refresh токен не предоставлен'
                });
            }

            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return callback({
                    code: 5,
                    message: 'Пользователь не найден'
                });
            }

            const accessToken = jwt.sign(
                { userId: user._id, login: user.login, role: user.role },
                JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            callback(null, {
                accessToken,
                user: mapUser(user)
            });
        } catch (error) {
            callback({
                code: 16,
                message: 'Невалидный или истёкший refresh токен'
            });
        }
    },

    GetMe: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return callback({
                    code: 5,
                    message: 'Пользователь не найден'
                });
            }

            callback(null, mapUser(user));
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    },

    GetUsers: async (call, callback) => {
        try {
            const decoded = verifyToken(call.metadata);
            if (!decoded) {
                return callback({
                    code: 16,
                    message: 'Не авторизован'
                });
            }

            const users = await User.find().select('-password');
            callback(null, { users: users.map(mapUser) });
        } catch (error) {
            callback({
                code: 13,
                message: error.message
            });
        }
    }
};

export { verifyToken };
export default authService;

