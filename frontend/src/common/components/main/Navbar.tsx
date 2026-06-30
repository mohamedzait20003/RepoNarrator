import { useStore } from '@/store';
import { useUser } from '@/lib/hooks/useUser';
import { cn } from '@/lib/utils/utils';

export function Navbar() {
  const { mode, toggleMode } = useStore();
  const { data: user } = useUser();

  return (
    <header className={cn('border-b border-border bg-background')}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 font-semibold text-primary">
          <span className="text-lg">RepoNarrator</span>
        </a>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.githubLogin}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-foreground">{user.githubLogin}</span>
            </div>
          ) : (
            <a
              href="/login"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Sign in with GitHub
            </a>
          )}

          <button
            onClick={toggleMode}
            aria-label="Toggle theme"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            {mode === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
