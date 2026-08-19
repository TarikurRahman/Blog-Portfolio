import { NextResponse } from 'next/server';

export class ApiResponse {
  static success(data: any = {}, message = 'Request successful', status = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  }

  static error(message = 'An error occurred', status = 400) {
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }

  static unauthorized(message = 'Unauthorized access') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Access forbidden') {
    return this.error(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }

  static serverError(message = 'Internal server error') {
    return this.error(message, 500);
  }
}
