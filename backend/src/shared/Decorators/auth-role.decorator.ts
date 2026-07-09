import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { AuthGuard, ROLES_KEY } from '@/shared/Guards/auth.guard';
import { UserRole } from '@/shared/Domain/enums/user-role.enum';

/**
 * Protects an endpoint (or controller). Requires a valid access token
 * (AuthGuard) and, when roles are given, one of those roles (enforced by
 * AuthGuard from the metadata this decorator sets).
 *
 *   @Roles()                       // any authenticated user
 *   @Roles(UserRole.SUPER_ADMIN)   // authenticated + super admin
 *
 * The consuming module registers AuthGuard (`providers: [AuthGuard]`) and has
 * `TOKEN_SERVICE` available (`imports: [IdentityModule]`).
 */
export function Roles(...roles: UserRole[]) {
  return applyDecorators(UseGuards(AuthGuard), SetMetadata(ROLES_KEY, roles));
}
