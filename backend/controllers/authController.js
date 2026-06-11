// ==============================
// controllers/authController.js
// This is where the actual login logic lives
// It checks your email + password and gives back a token
// ==============================

const bcrypt = require('bcryptjs');       // For checking hashed passwords
const jwt = require('jsonwebtoken');      // For creating login tokens
const prisma = require('../config/prisma'); // For talking to the database

// ==============================
// LOGIN FUNCTION
// Called when someone sends POST /api/auth/login
// ==============================

const login = async (req, res) => {

  try {

    // ---- STEP 1: Get email and password from the request ----
    // When the frontend sends a login form, the data arrives in req.body
    // It looks like: { email: "heshan@gmail.com", password: "mypassword123" }
    const { email, password } = req.body;

    // ---- STEP 2: Check that both fields are provided ----
    // If someone sends a request without email or password, reject it immediately
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // ---- STEP 3: Look up the user in the database by email ----
    // prisma.user.findUnique means "find exactly one user where email matches"
    // Think of it like searching a spreadsheet for a specific row
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    // If no user found with that email, send error
    // Note: We say "invalid credentials" instead of "email not found"
    // This is a security trick — we don't want hackers to know which emails exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ---- STEP 4: Check if the account is active ----
    // Member A added an isActive field — if admin deactivated this user, block login
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact your administrator.'
      });
    }

    // ---- STEP 5: Check if the password is correct ----
    // Passwords in the database are HASHED (scrambled for security)
    // Example: "mypassword123" is stored as "$2a$10$xK9Lm3..."
    // bcrypt.compare checks if the plain password matches the hashed one
    // It returns true or false
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ---- STEP 6: Create a JWT token ----
    // JWT is like a stamped visitor pass
    // It contains the user's ID and role so we know WHO is making requests later
    // It expires after 7 days (from your .env file)
    const token = jwt.sign(
      {
        userId: user.id,       // Who this token belongs to
        role: user.role        // Their role: ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR
      },
      process.env.JWT_SECRET,          // The secret key to sign with (from .env)
      { expiresIn: process.env.JWT_EXPIRES_IN }  // How long until it expires
    );

    // ---- STEP 7: Send back the token and user info ----
    // We send everything the frontend needs to store and use
    // Notice we do NOT send the password back — never expose passwords!
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustResetPassword: user.mustResetPassword
      }
    });

  } catch (error) {
    // If something unexpected goes wrong (database down, etc.)
    // Log the real error on the server but send a safe message to the frontend
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
  }
;
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustResetPassword: false
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

// Export so authRoutes.js can use it
module.exports = {
  login,
  changePassword
};