import { Global, Module } from '@nestjs/common';

import { IdentityModule } from '../../modules/identity/identity.module';
import { AuthGuard } from '../Guards/auth.guard';
import { RolesGuard } from '../Guards/roles.guard';

/**
 * Cross-cutting security infrastructure. Marked `@Global` so ANY feature module
 * (not just identity) can protect its routes with `@UseGuards(AuthGuard, RolesGuard)`
 * without importing this module explicitly.
 *
 * The guards depend on the identity `TokenService` via the `TOKEN_SERVICE`
 * contract, which `IdentityModule` binds and exports — hence the import here.
 */
@Global()
@Module({
  imports: [IdentityModule],
  providers: [AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard],
})
export class SecurityModule {}
