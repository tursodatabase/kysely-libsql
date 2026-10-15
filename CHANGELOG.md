# Changelog

## Unreleased

- `@libsql/client` is now a peer dependency (`>=0.9.0 <1`), so the dialect uses the application's own client
  instead of bundling a second copy. Fixes the type mismatch with newer clients (#12). Apps that create the
  dialect from a `url` must now install `@libsql/client` themselves.

## 0.4.0 -- 2024-07-09

- Use @libsql/client instead of @libsql/hrana-client.

## 0.3.0 -- 2023-06-12

- **Added support for interactive transactions over HTTP** by using `@libsql/hrana-client` version 0.4
