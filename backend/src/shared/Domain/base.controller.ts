import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T> {
  Message: string;
  Data: T;
}

export abstract class BaseController {
  protected ok<T>(data: T, message = 'Success'): ApiResponse<T> {
    return { Message: message, Data: data };
  }

  protected message(msg: string): ApiResponse<null> {
    return { Message: msg, Data: null };
  }

  protected statusCode(code: HttpStatus): number {
    return code;
  }
}
