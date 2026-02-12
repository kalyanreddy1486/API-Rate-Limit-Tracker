const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt.util');

async function signup(req, res, next) {
  try {
    const { email, password } = req.validatedData;
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });
    
    const token = generateToken({ userId: user.id, email: user.email });
    
    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.validatedData;
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        },
      });
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        },
      });
    }
    
    const token = generateToken({ userId: user.id, email: user.email });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

module.exports = { signup, login, logout };
