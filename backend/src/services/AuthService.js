const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../config/env');
const logger = require('../utils/logger');

class AuthService {
  constructor(userService) {
    this.userService = userService;
  }

  async register(userData) {
    const { name, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return this.userService.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
  }

  async login(email, password) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: 'Authentication failed: User not found.' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw { statusCode: 401, message: 'Authentication failed: Invalid credentials.' };
    }

    const tokens = this.generateTokens(user);
    return { user: { id: user.id, name: user.name, role: user.role }, ...tokens };
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  async refresh(token) {
    try {
      if (!token) {
        throw { statusCode: 401, message: 'Refresh token protocol missing.' };
      }
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
      const user = await this.userService.getById(decoded.id);
      if (!user) throw new Error('Operative not found in registry');
      
      const tokens = this.generateTokens(user);
      return { 
        accessToken: tokens.accessToken, 
        refreshToken: tokens.refreshToken, // Return new refresh token for rotation
        user: { id: user.id, name: user.name, role: user.role } 
      };
    } catch (err) {
      logger.error('Session rotation failed:', err);
      throw { statusCode: 403, message: 'Invalid or expired session credentials.' };
    }
  }

  async getAllUsers() {
    return this.userService.getAll();
  }

  async deleteUser(id) {
    return this.userService.delete(id);
  }
}

module.exports = AuthService;
