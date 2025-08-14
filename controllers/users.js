const mongodb = require('../data/database');
const bcrypt = require('bcrypt');

const DB_NAME = 'edusync_api';
const COLLECTION_NAME = 'users';

const registerUser = async (req, res) => {
    // #swagger.tags = ['Users']
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }

        const db = mongodb.getDatabase().db(DB_NAME);
        const existingUser = await db.collection(COLLECTION_NAME).findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, email, password: hashedPassword };

        const result = await db.collection(COLLECTION_NAME).insertOne(user);

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertedId
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
};

const loginUser = async (req, res) => {
    // #swagger.tags = ['Users']
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const db = mongodb.getDatabase().db(DB_NAME);
        const user = await db.collection(COLLECTION_NAME).findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        res.status(200).json({
            message: 'Login successful',
            user: req.session.user
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
};

const logoutUser = (req, res) => {
    // #swagger.tags = ['Users']
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};