class customError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
      super(message); // Gọi constructor của lớp Error
      this.name = 'Error';
      this.statusCode = statusCode;
  }
}

export default customError;
