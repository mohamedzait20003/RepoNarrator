import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../Domain/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route (or controller) to the given roles.
 * Must be combined with `AuthGuard` + `RolesGuard`:
 *
 *   @UseGuards(AuthGuard, RolesGuard)
 *   @Roles(UserRole.SUPER_ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
