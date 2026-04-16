# CatSAMA AI Service Integration Plan

## Goal

CatSAMA should not stop at device state lookup or a thin chatbot. The core product value is an AI-native service loop where conversation leads to:

- smart home control
- multi-step user plans
- context-aware recommendations
- long-running automation delegated to the system
- synchronized VTuber feedback

The current project already contains the right building blocks:

- Next.js frontend
- Home Assistant integration
- local LLM access through Ollama
- VTuber output bridge

What is missing is the orchestration layer that turns chat into safe, structured actions.

## Current State Observed In This Repository

### What already exists

- `app/components/HA_API/api.tsx`
  - reads Home Assistant states
  - subscribes to state changes
  - calls HA services
- `app/components/Chat/LLMService.ts`
  - sends messages to Ollama
  - classifies messages into casual vs IoT
- `app/components/Chat/ExecuteCode.ts`
  - executes hard-coded commands from LLM output
- `app/components/Chat/vtuberSpeechBridge.ts`
  - forwards assistant text to the VTuber websocket
- `app/components/HA_Dashboard/HomeAssistantDashboard.tsx`
  - renders a native HA dashboard and allows direct control

### Structural limits

1. The LLM control path is string-based and fragile.
   - The model emits `#IOT# [toggleAirPurifier]` style text.
   - The frontend parses text and maps it to hard-coded functions.
   - This does not scale to many devices, parameters, or multi-step tasks.

2. Action execution happens in the client.
   - Device actions are triggered from browser-side code.
   - This weakens security, auditing, and permission control.

3. There is no planner/executor separation.
   - The same response tries to classify intent, choose an action, and produce user-facing copy.
   - Multi-step plans such as "run my evening routine if air quality is bad" need a stateful executor.

4. There is no durable memory or task state.
   - User preferences, routines, unfinished plans, and prior outcomes are not persisted as first-class AI state.

5. API boundaries are unclear inside the app repo.
   - The frontend expects `/api/ollama/chat`, `/api/ha`, and `/vtuber-ws`.
   - Those routes are not clearly defined in this Next app, so the orchestration path is hard to reason about and test.

## Recommended Target Architecture

### 1. Convert chat into structured AI actions

Replace the current `#IOT#` tag protocol with a structured action contract.

Recommended LLM output shape:

```json
{
  "mode": "action",
  "reply": "I will turn on the purifier and lower the living room temperature.",
  "actions": [
    {
      "tool": "ha_call_service",
      "args": {
        "domain": "fan",
        "service": "turn_on",
        "entity_id": "fan.zhimi_airpurifier_mb4"
      }
    },
    {
      "tool": "ha_call_service",
      "args": {
        "domain": "climate",
        "service": "set_temperature",
        "entity_id": "climate.living_room",
        "temperature": 23
      }
    }
  ]
}
```

Benefits:

- device-agnostic
- parameterized actions
- easier validation
- easier logging
- possible to retry or partially fail

### 2. Introduce a server-side AI orchestrator

Add a single orchestration route in Next, for example:

- `app/api/assistant/route.ts`

Responsibilities:

- receive chat history and current user message
- inject device context and user context
- call Ollama with a strict response schema
- validate action payload
- execute allowed tools server-side
- return reply + execution result summary

This should become the only path the UI uses for AI-driven actions.

### 3. Define a tool registry instead of hard-coded command names

Create a registry layer such as:

- `app/lib/assistant/tools.ts`

Example tool set:

- `ha_get_state`
- `ha_list_entities`
- `ha_call_service`
- `create_plan`
- `run_plan_step`
- `schedule_routine`
- `vtuber_speak`

Each tool should define:

- input schema
- permission policy
- execution handler
- user-visible audit label

This turns the assistant into a controlled tool-using system rather than a text parser.

### 4. Separate intent detection, planning, and execution

Use a simple pipeline:

1. Detect request type
   - casual conversation
   - smart home control
   - information query
   - planning request
   - automation request

2. Build a plan
   - single action
   - multi-step action
   - deferred routine

3. Execute with checks
   - entity existence
   - allowed domains/services
   - required confirmation for risky actions

4. Summarize outcome
   - what was done
   - what failed
   - what remains pending

This prevents the assistant from collapsing everything into one prompt and one brittle response.

### 5. Add user memory and preference state

Create a lightweight persistence layer for:

- preferred room names
- favorite routines
- sleep/wake schedule
- comfort preferences
- risk settings
- confirmation rules

A minimal first version can use a local JSON or SQLite store. Recommended shape:

- `users`
- `preferences`
- `saved_plans`
- `plan_runs`
- `conversation_memory`

Examples:

- "At night, keep the bedroom at 22 degrees."
- "Never unlock the front door without confirmation."
- "If outdoor air is bad, turn on the purifier automatically."

Without this layer, CatSAMA cannot act like a personalized service.

### 6. Treat plans as first-class objects

For personalized execution, add a plan model:

```json
{
  "id": "plan_evening_001",
  "title": "Weekday evening comfort routine",
  "trigger": "manual",
  "steps": [
    { "tool": "ha_call_service", "args": { "domain": "light", "service": "turn_on", "entity_id": "light.living_room" } },
    { "tool": "ha_call_service", "args": { "domain": "climate", "service": "set_temperature", "entity_id": "climate.living_room", "temperature": 23 } },
    { "tool": "vtuber_speak", "args": { "text": "Your evening room setup is ready." } }
  ]
}
```

This enables:

- reusable routines
- resumable execution
- scheduled automation
- history and observability

### 7. Add confirmation tiers for risky actions

Not every command should execute immediately.

Recommended policy:

- low risk
  - light, fan, media, purifier toggle
- medium risk
  - thermostat changes, appliance power
- high risk
  - door locks, garage doors, security modes, purchases

The orchestrator should require confirmation before high-risk execution, even if the LLM requests it.

### 8. Use Home Assistant entity metadata as AI context

Before the assistant acts, provide it:

- available entities
- friendly names
- domains
- current states
- important attributes

Do not dump every raw entity every turn. Instead:

- keep a cached entity index
- retrieve relevant subsets per request
- compress device context into a small structured summary

This improves accuracy and reduces prompt size.

### 9. Integrate VTuber as an output channel, not the control source

The VTuber should reflect the assistant result after orchestration completes.

Recommended flow:

- user message
- assistant plan/action execution
- result summary returned to UI
- VTuber receives only final speech text

This avoids desynchronization where the avatar speaks before actions succeed.

## Implementation Roadmap For This Project

### Phase 1. Stabilize the AI control path

Priority: highest

- add `app/api/assistant/route.ts`
- move Ollama calls from client helper into this route
- return strict JSON instead of tag-based text
- replace `ExecuteCode.ts` with server-side tool execution
- keep the chat UI unchanged except for using the new route

Deliverable:

- one conversational endpoint that can safely control HA devices

### Phase 2. Generalize smart home actions

- build a Home Assistant tool wrapper on the server
- support:
  - list entities
  - get entity state
  - call service
- add allowlists for safe domains/services
- expose execution results back to the chat transcript

Deliverable:

- CatSAMA can control more than one hard-coded purifier command

### Phase 3. Add plan creation and execution

- introduce `plans` and `plan_runs`
- let the assistant produce multi-step plans
- store plans for replay
- surface plan status in the UI

Deliverable:

- "prepare sleep mode", "morning startup", "air-quality routine" become reusable service flows

### Phase 4. Add personalization and memory

- persist user preferences
- inject preference summaries into the orchestrator
- let users review and edit saved routines

Deliverable:

- CatSAMA adapts behavior to the user, not just the current sentence

### Phase 5. Add automation and proactive service

- connect saved plans to schedules or condition triggers
- if desired, bridge into Home Assistant automations
- let the assistant propose routines based on observed patterns

Deliverable:

- the service becomes continuously useful even outside active chat sessions

## Recommended File-Level Refactor

### Replace or reduce responsibility in existing files

- `app/components/Chat/LLMService.ts`
  - should become a thin client fetcher to `/api/assistant`
- `app/components/Chat/ExecuteCode.ts`
  - should be removed after tool execution moves server-side
- `app/components/Chat/parseResponse.ts`
  - should be replaced by JSON schema validation
- `app/components/Chat/prompts.ts`
  - should be split into:
    - system instruction
    - tool schema instruction
    - planner prompt
    - reply summarizer prompt

### Add new modules

- `app/api/assistant/route.ts`
- `app/lib/assistant/orchestrator.ts`
- `app/lib/assistant/tools.ts`
- `app/lib/assistant/policies.ts`
- `app/lib/assistant/memory.ts`
- `app/lib/assistant/plans.ts`
- `app/lib/assistant/types.ts`

## Minimal Viable Version

If implementation time is limited, build this subset first:

1. server-side `/api/assistant`
2. strict JSON action output from Ollama
3. HA service execution allowlist
4. confirmation gate for risky actions
5. plan save/run for a few reusable routines

That is enough to move the product from demo-grade chat control to a real AI service loop.

## Success Criteria

The implementation is successful when CatSAMA can do all of the following reliably:

- interpret natural language into structured actions
- control multiple Home Assistant devices without hard-coded command names
- create and run reusable multi-step plans
- remember user preferences that affect future execution
- require confirmation for risky actions
- keep UI, device state, and VTuber speech synchronized

## Immediate Next Recommendation

The best next build step in this repository is:

1. add a server-side assistant orchestration API
2. move all AI-triggered Home Assistant actions behind that API
3. replace `#IOT#` parsing with validated JSON actions

That change unlocks every higher-level capability the product actually needs.
