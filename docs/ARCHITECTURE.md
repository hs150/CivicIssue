# Architecture

```text
                    ┌─────────────────────┐
                    │   React Web / PWA   │
                    │ Citizen + Officer   │
                    └──────────┬──────────┘
                               │ HTTPS / REST
                               ▼
                    ┌─────────────────────┐
                    │ Express API         │
                    │ Auth / Issues       │
                    │ Comments / Workflow │
                    └───────┬─────┬───────┘
                            │     │
                            ▼     ▼
                     ┌────────┐ ┌────────────┐
                     │MongoDB │ │ Cloudinary │
                     └────────┘ └────────────┘
                            │
                            ▼
                    Status history / audit
```

The implementation intentionally uses a modular monolith. It is easier to build and deploy in a hackathon and can later be separated into services if traffic or organizational boundaries justify it.

## Smart layer

1. Category → department routing
2. Priority score from category severity + community support
3. Nearby duplicate suggestions

## Deliberately postponed

- Native mobile apps
- WebSockets
- Microservices
- AI image classification
- Complex role hierarchy
- Bulk imports
- Third-party municipal integrations
