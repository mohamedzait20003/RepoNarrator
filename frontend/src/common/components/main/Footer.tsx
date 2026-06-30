export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} RepoNarrator. All rights reserved.
      </div>
    </footer>
  );
}
