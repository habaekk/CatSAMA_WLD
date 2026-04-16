# Home Assistant REST vs WebSocket Performance

Measured on 2026-03-24 10:47:07 KST against local Home Assistant at `http://127.0.0.1:8123`.

## Context

- Frontend code currently polls Home Assistant over REST with `getStates()`.
- Poll interval in the dashboard is `15000ms`.
- Sample size for the benchmark below was `50` runs per mode.
- Observed entity count was `22`.
- Average payload size was `9463 bytes`.

Relevant code:

- `app/components/HA_API/api.tsx`
- `app/components/HA_Dashboard/HomeAssistantDashboard.tsx`

## Results

| Mode | Avg | P50 | P95 | Min | Max |
| --- | ---: | ---: | ---: | ---: | ---: |
| REST `/api/states` | 1.81ms | 1.24ms | 2.20ms | 0.97ms | 22.66ms |
| WebSocket cold connect + auth + `get_states` | 2.58ms | 2.29ms | 3.68ms | 1.77ms | 7.13ms |
| WebSocket warm persistent `get_states` | 0.69ms | 0.62ms | 1.06ms | 0.53ms | 1.66ms |

## Service Call Benchmark

Measured on 2026-03-24 10:50:56 KST against the same local Home Assistant instance.

Service under test:

- `homeassistant.update_entity`
- target entity: `sun.sun`
- sample size: `50` runs per mode
- reason for choosing it: service-call path can be measured without toggling a real device

Observed response shape:

- REST returned an empty array `[]`
- WebSocket returned a result envelope object

| Mode | Avg | P50 | P95 | Min | Max |
| --- | ---: | ---: | ---: | ---: | ---: |
| REST `POST /api/services/homeassistant/update_entity` | 2.14ms | 1.49ms | 3.27ms | 1.24ms | 22.68ms |
| WebSocket cold connect + auth + `call_service(update_entity)` | 2.49ms | 2.23ms | 3.90ms | 1.61ms | 7.29ms |
| WebSocket warm persistent `call_service(update_entity)` | 0.65ms | 0.62ms | 1.01ms | 0.49ms | 1.25ms |

## Service Call Takeaway

- For a single one-off service call, REST was slightly faster than creating a fresh WebSocket connection.
- For repeated service calls on an already-open socket, WebSocket was clearly faster.
- This matches the state-read benchmark: the performance gain comes from reusing the connection, not from the first call.

## Takeaway

- For a single request, REST was slightly faster than opening a fresh WebSocket connection.
- For repeated requests on a persistent connection, WebSocket was much faster than REST.
- For this dashboard use case, WebSocket is the better long-lived transport because it avoids polling and can move to push-based updates instead of repeatedly fetching the full state list.

## Notes

- These numbers were measured locally, so network latency was minimal.
- The larger product benefit of WebSocket here is not just lower request time. It is the ability to subscribe to state changes and avoid unnecessary full refreshes.
