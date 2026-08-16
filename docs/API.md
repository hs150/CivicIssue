# CivicConnect API Quick Reference

Base URL: `/api`

## Authentication

### POST `/auth/register`

```json
{
  "name": "Asha",
  "email": "asha@example.com",
  "password": "secret123"
}
```

### POST `/auth/login`

Returns a JWT and user object.

### GET `/auth/me`

Requires `Authorization: Bearer <token>`.

## Issue creation

`POST /issues` as `multipart/form-data`.

Fields:

- `title`
- `description`
- `category`
- `latitude`
- `longitude`
- `address`
- `image` (optional)

## Issue state machine

```text
NEW → IN_PROGRESS → RESOLVED → CLOSED
```

## Recommended future Open311 mapping

- CivicConnect `category` → Open311 `service_code`
- `title` / `description` → request description fields
- `latitude` / `longitude` → request location
- `imageUrl` → `media_url`
- `issueCode` → `service_request_id`

This keeps the internal prototype compatible with a future municipal Open311 adapter.
