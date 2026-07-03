import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T> {
  Message: string;
  Data: T;
}

/**
 * Provides response-shaping helpers used by all identity/access controllers.
 * Keeps response structure consistent with the frontend contract:
 * success → { Message, Data }  |  message-only → { Message, Data: null }
 */
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
