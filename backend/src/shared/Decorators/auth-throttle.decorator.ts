import { applyDecorators, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Applies IP-based rate limiting to a controller (or route). The limit itself
 * (5 requests / minute / IP) is configured once in `ThrottlerModule.forRoot`;
 * this decorator only activates the guard, so throttling is opt-in per route
 * group rather than global. Used on the auth controllers.
 */
export function AuthThrottle() {
  return applyDecorators(UseGuards(ThrottlerGuard));
}
