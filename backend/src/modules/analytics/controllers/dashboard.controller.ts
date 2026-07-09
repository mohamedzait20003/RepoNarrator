import { Controller, Get } from '@nestjs/common';

import { Roles } from '@/shared/Decorators/auth-role.decorator';
import { CurrentUser } from '@/shared/Decorators/current-user.decorator';
import { UserRole } from '@/shared/Domain/enums/user-role.enum';
import type { AuthenticatedUser } from '@/shared/Contracts/authenticated-user.contract';
import { DashboardService } from '@/modules/analytics/services/dashboard.service';
import type { DashboardData } from '@/modules/analytics/dto/dashboard.dto';

@Controller('analytics')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** Client dashboard summary for the signed-in user (customer role only). */
  @Roles(UserRole.USER)
  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthenticatedUser): Promise<DashboardData> {
    return this.dashboardService.getDashboard(user.userId);
  }
}
