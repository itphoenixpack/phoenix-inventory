class ApiResponse {
  constructor(success, message, data = null, error = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (error) this.error = error;
  }

  static success(message, data = null) {
    return new ApiResponse(true, message, data);
  }

  static error(message, error = null) {
    return new ApiResponse(false, message, null, error);
  }
}

module.exports = ApiResponse;
