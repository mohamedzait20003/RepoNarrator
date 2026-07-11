import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/modules/identity/entities/user.entity';
import { EncryptionService } from '@/modules/identity/services/encryption.service';
import type { RepoContext } from '../context/narration-context';

const GH = 'https://api.github.com';
const MAX_REPOS = 6;
const README_MAX = 4_000;

interface GithubRepoRaw {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
}

export interface GithubReadResult {
  profileReadme: string | null;
  repos: RepoContext[];
}

/**
 * Reads a user's GitHub content for the narration agent — the profile-repo
 * README plus their top projects (metadata + README excerpts). Uses the stored,
 * decrypted OAuth token; server-side only.
 */
@Injectable()
export class GithubReaderService {
  private readonly logger = new Logger(GithubReaderService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly encryption: EncryptionService,
  ) {}

  async read(userId: string): Promise<GithubReadResult | null> {
    const creds = await this.credentials(userId);
    if (!creds) return null;
    const { login, token } = creds;

    const profileReadme = await this.readme(login, login, token);

    const repos = (await this.listRepos(token, login)).slice(0, MAX_REPOS);
    const withReadmes: RepoContext[] = [];
    for (const r of repos) {
      withReadmes.push({
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        readme: await this.readme(login, r.name, token),
      });
    }

    return { profileReadme, repos: withReadmes };
  }

  private async credentials(
    userId: string,
  ): Promise<{ login: string; token: string } | null> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user?.githubLogin || !user.githubOauthTokenEnc) return null;
    try {
      return {
        login: user.githubLogin,
        token: this.encryption.decrypt(user.githubOauthTokenEnc),
      };
    } catch {
      return null;
    }
  }

  private async listRepos(
    token: string,
    login: string,
  ): Promise<GithubRepoRaw[]> {
    const res = await fetch(
      `${GH}/user/repos?per_page=100&sort=updated&affiliation=owner`,
      { headers: this.headers(token) },
    );
    if (!res.ok) {
      this.logger.warn(`Repo list failed for @${login}: ${res.status}`);
      return [];
    }
    const all = (await res.json()) as GithubRepoRaw[];
    const profile = login.toLowerCase();
    return all.filter((r) => !r.fork && r.name.toLowerCase() !== profile);
  }

  private async readme(
    owner: string,
    repo: string,
    token: string,
  ): Promise<string | null> {
    const res = await fetch(`${GH}/repos/${owner}/${repo}/readme`, {
      headers: { ...this.headers(token), Accept: 'application/vnd.github.raw' },
    });
    if (!res.ok) return null; // 404 = no README
    const text = await res.text();
    return text.slice(0, README_MAX);
  }

  private headers(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }
}
