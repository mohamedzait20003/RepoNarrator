export enum GenerationKind {
  /** Per-repo README generation — "Narrate about Repos" (targets one repository). */
  REPO_README = 'repo_readme',
  /** Profile README from all repos + résumé — "Narrate Yourself" (no single repo). */
  PROFILE = 'profile',
}
