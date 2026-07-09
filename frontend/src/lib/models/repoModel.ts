import type { ApiResponse } from "./baseModel";
import type { PagedResult } from "./pagedResult";

export interface RepoItem {
  Id: string;
  Name: string;
  FullName: string;
  Private: boolean;
  DefaultBranch: string;
  Language: string | null;
  Stars: number;
  UpdatedAt: string;
  HtmlUrl: string;
}

export type ReposResponse = ApiResponse<PagedResult<RepoItem>>;
