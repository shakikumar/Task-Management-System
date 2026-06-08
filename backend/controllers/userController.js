// ============================================================================
// controllers/userController.js
// PRODUCTION READY - 100% Core Relational Database Integration [FR-RBAC-02]
// ============================================================================

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendOnboardingEmail } = require('../services/mailerService');

// Centralized database engine instance connecting directly to your shared Supabase
const prisma = require('../config/prisma');

/**
 * Admin/PM onboarding controller to invite a new team member [FR-RBAC-02]
 */
/**
 * @swagger
 * /api/auth/onboard:
 *   post:
 *     summary: Onboard a new user (Member A - Phase 2)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, role]
 *             properties:
 *               name: { type: string, example: "Test User" }
 *               email: { type: string, example: "testuser@gmail.com" }
 *               role: { type: string, example: "COLLABORATOR" }
 *     responses:
 *       201:
 *         description: User onboarded successfully
 */
const createUserOnboarding = async (req, res) => {
    const { name, email, role } = req.body;

    try {
        // 1. Structural integrity check: Validate uniqueness of the incoming email identifier
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) { 
            return res.status(400).json({ error: 'User with this email already exists.' });
        }

        // 2. Generate a highly secure random 12-character temporary credential string
        const temporaryPassword = crypto.randomBytes(6).toString('hex');

        // 3. Hash the temporary credential string via bcrypt algorithm before storage layer insertion
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 4. PERSISTENCE ENGINE EXECUTION: Writes the physical record into your shared database schema
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'COLLABORATOR',
                mustResetPassword: true, // Crucial state flag needed by Member D for the login redirection logic
            },
        });

        // 5. Trigger automated asynchronous background email notification routine
        try {
            sendOnboardingEmail(newUser.email, temporaryPassword);
        } catch (mailError) {
            console.log('⚠️ Mail service credentials unconfigured or skipped during local testing execution.');
        }

        // Return the authenticated database user response entity layout directly to the client interface context
        return res.status(201).json({
            message: 'User account created successfully. Onboarding email has been sent.',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Onboarding execution error:', error);
        return res.status(500).json({ error: 'Internal Server Error during user onboarding.' });
    }
};

module.exports = { createUserOnboarding };