# Contributing to PropertyHub

## Setup

```sh
npm --prefix server install
npm --prefix client install
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Start MongoDB and run `npm --prefix server run dev` plus `npm --prefix client run dev` in separate terminals.

## Workflow

1. Fork the repository and create a focused feature or fix branch.
2. Keep environment secrets out of commits.
3. Run backend tests and frontend lint/build before opening a Pull Request:

   ```sh
   npm --prefix server test
   npm --prefix client run lint
   npm --prefix client run build
   ```

4. Use Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, and `chore:`.
5. Describe the behavior changed and the reason for the change in the Pull Request.
