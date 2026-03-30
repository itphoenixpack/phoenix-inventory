class NotificationRepository {
  constructor(knex) {
    this.knex = knex;
  }

  async getAll() {
    return this.knex('notifications').select('*').orderBy('created_at', 'desc');
  }

  async markAsRead(id) {
    return this.knex('notifications').where({ id }).update({ is_read: true });
  }

  async create(data) {
    return this.knex('notifications').insert({
      ...data,
      created_at: this.knex.fn.now()
    }).returning('*');
  }
}

module.exports = NotificationRepository;
