import { Controller, Get, Query } from '@nestjs/common';

import { Roles } from '@/shared/Decorators/auth-role.decorator';
import { CurrentUser } from '@/shared/Decorators/current-user.decorator';
import { UserRole } from '@/shared/Domain/enums/user-role.enum';
import type { AuthenticatedUser } from '@/shared/Contracts/authenticated-user.contract';
import type { PagedResult } from '@/shared/Common/paged-result';
import { GithubReposService } from '@/modules/repos/services/github-repos.service';
import { ListReposQuery } from '@/modules/repos/dto/list-repos.query';
import type { RepoItem } from '@/modules/repos/dto/repo.dto';

@Controller('repos')
export class ReposController {
  constructor(private readonly repos: GithubReposService) {}

  /**
   * Paged list of the signed-in user's own GitHub repositories (excluding the
   * profile repo). Reads only the caller's own token — no userId is accepted.
   * Customer role only.
   */
  @Roles(UserRole.USER)
  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListReposQuery,
  ): Promise<PagedResult<RepoItem>> {
    return this.repos.list(user.userId, query.page, query.pageSize);
  }
}
