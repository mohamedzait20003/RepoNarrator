import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { User } from '@/modules/identity/entities/user.entity';
import { EncryptionService } from '@/modules/identity/services/encryption.service';
import {
  paginate,
  type PagedResult,
} from '@/shared/Common/paged-result';
import type { RepoItem } from '@/modules/repos/dto/repo.dto';

/** The full repo list is cached per user; pages are sliced from it in-memory. */
const REPOS_TTL_MS = 120_000;
const PER_PAGE = 100;
const MAX_PAGES = 5; // hard cap: 500 repos

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

/**
 * Reads a user's own GitHub repositories (excluding the owner/owner profile
 * repo) using their stored, encrypted OAuth token. The token is decrypted
 * server-side and never leaves the server. The full list is cached per-user to
 * stay well under GitHub's rate limit; pagination is served from that cache.
 */
@Injectable()
export class GithubReposService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly encryption: EncryptionService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async list(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PagedResult<RepoItem>> {
    const all = await this.getAllRepos(userId);
    return paginate(all, page, pageSize);
  }

  /** Full, profile-repo-excluded repo list for the user (cached). */
  private async getAllRepos(userId: string): Promise<RepoItem[]> {
    const key = `repos:${userId}`;

    const cached = await this.cache.get<RepoItem[]>(key);
    if (cached) return cached;

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user?.githubOauthTokenEnc) return []; // GitHub not linked

    let token: string;
    try {
      token = this.encryption.decrypt(user.githubOauthTokenEnc);
    } catch {
      return []; // tampered/unreadable token — treat as not linked
    }

    const profileRepo = user.githubLogin?.toLowerCase() ?? null;

    const items = (await this.fetchAllRepos(token))
      .filter((r) => r.name.toLowerCase() !== profileRepo)
      .map((r): RepoItem => ({
        Id: String(r.id),
        Name: r.name,
        FullName: r.full_name,
        Private: r.private,
        DefaultBranch: r.default_branch,
        Language: r.language,
        Stars: r.stargazers_count,
        UpdatedAt: r.updated_at,
        HtmlUrl: r.html_url,
      }));

    await this.cache.set(key, items, REPOS_TTL_MS);
    return items;
  }

  private async fetchAllRepos(token: string): Promise<GithubRepo[]> {
    const all: GithubRepo[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(
        `https://api.github.com/user/repos?per_page=${PER_PAGE}&page=${page}&sort=updated&affiliation=owner`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );

      if (!res.ok) {
        throw new BadGatewayException(
          'Could not load repositories from GitHub.',
        );
      }

      const batch = (await res.json()) as GithubRepo[];
      all.push(...batch);
      if (batch.length < PER_PAGE) break; // last page
    }

    return all;
  }
}
