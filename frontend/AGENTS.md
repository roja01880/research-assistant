<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The React frontend (this folder) talks to the Python backend in ../backend through src/lib/api.ts. Keep API calls in that file.
- Research answers must come only from the user's uploaded papers. Never add fixture or demo content that could be mistaken for real findings.
