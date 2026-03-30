class NotificationService {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async getNotifications() {
    return this.notificationRepository.getAll();
  }

  async markAsRead(id) {
    return this.notificationRepository.markAsRead(id);
  }

  async createNotification(type, message) {
    return this.notificationRepository.create({ type, message, is_read: false });
  }
}

module.exports = NotificationService;
