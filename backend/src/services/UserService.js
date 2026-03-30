const BaseService = require('./BaseService');

class UserService extends BaseService {
  constructor(userRepository) {
    super(userRepository);
  }

  async findByEmail(email) {
    return this.repository.findByEmail(email);
  }
}

module.exports = UserService;
