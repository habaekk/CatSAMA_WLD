'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  HomeAssistantEntity,
  callService,
  getStates,
  subscribeToStateChanges,
  toggleEntity,
} from '../HA_API/api';

type CardDefinition = {
  entityId: string;
  accent: string;
};

type DisplayEntity = {
  entityId: string;
  title: string;
  subtitle: string;
  domain: string;
  state: string;
  accent: string;
  icon: string;
  actionLabel: string;
  details: string[];
  canToggle: boolean;
  raw: HomeAssistantEntity;
};

const STORAGE_KEY = 'ha-dashboard-layout-v1';
const RECONNECT_DELAY_MS = 3000;

const DEFAULT_CARDS: CardDefinition[] = [
  { entityId: 'fan.zhimi_airpurifier_mb4', accent: '#19e2cf' },
  { entityId: 'weather.forecast_home', accent: '#5fb0ff' },
  { entityId: 'sun.sun', accent: '#ffbe55' },
  { entityId: 'sensor.outdoor_temperature', accent: '#ff7a59' },
  { entityId: 'climate.living_room', accent: '#c788ff' },
  { entityId: 'switch.coffee_machine', accent: '#8ef58a' },
];

const domainIcons: Record<string, string> = {
  light: 'L',
  switch: 'S',
  fan: 'F',
  climate: 'C',
  sensor: 'M',
  weather: 'W',
  sun: 'U',
  media_player: 'P',
  lock: 'K',
  cover: 'V',
};

const readStoredLayout = (): CardDefinition[] | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as CardDefinition[];

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter((item) => typeof item.entityId === 'string');
  } catch {
    return null;
  }
};

const formatState = (entity: HomeAssistantEntity) => {
  const unit = entity.attributes.unit_of_measurement;
  return unit ? `${entity.state} ${unit}` : entity.state;
};

const humanizeEntityId = (entityId: string) =>
  entityId
    .split('.')
    .pop()
    ?.split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ') ?? entityId;

const buildDetails = (entity: HomeAssistantEntity) => {
  const details: string[] = [];
  const { attributes } = entity;

  if (typeof attributes.current_temperature === 'number') {
    details.push(`Now ${attributes.current_temperature} deg`);
  }

  if (typeof attributes.temperature === 'number') {
    details.push(`Target ${attributes.temperature} deg`);
  }

  if (typeof attributes.brightness === 'number') {
    details.push(`Brightness ${Math.round((attributes.brightness / 255) * 100)}%`);
  }

  if (typeof attributes.hvac_action === 'string') {
    details.push(`Mode ${attributes.hvac_action}`);
  }

  if (details.length === 0 && typeof attributes.device_class === 'string') {
    details.push(attributes.device_class);
  }

  return details.slice(0, 2);
};

const getActionLabel = (entity: HomeAssistantEntity) => {
  const [domain] = entity.entity_id.split('.');

  if (domain === 'climate') {
    return 'Set mode';
  }

  if (domain === 'lock') {
    return entity.state === 'locked' ? 'Unlock' : 'Lock';
  }

  return entity.state === 'on' ? 'Turn off' : 'Turn on';
};

const canToggleDomain = (domain: string) =>
  ['light', 'switch', 'fan', 'input_boolean', 'humidifier'].includes(domain);

const toDisplayEntity = (
  card: CardDefinition,
  entity: HomeAssistantEntity
): DisplayEntity => {
  const [domain] = entity.entity_id.split('.');

  return {
    entityId: entity.entity_id,
    title: entity.attributes.friendly_name ?? humanizeEntityId(entity.entity_id),
    subtitle: domain.replace('_', ' '),
    domain,
    state: formatState(entity),
    accent: card.accent,
    icon: domainIcons[domain] ?? 'HA',
    actionLabel: getActionLabel(entity),
    details: buildDetails(entity),
    canToggle: canToggleDomain(domain),
    raw: entity,
  };
};

const upsertEntity = (
  current: HomeAssistantEntity[],
  entityId: string,
  nextState: HomeAssistantEntity | null
) => {
  const next = current.filter((entity) => entity.entity_id !== entityId);

  if (!nextState) {
    return next;
  }

  return [...next, nextState].sort((a, b) => a.entity_id.localeCompare(b.entity_id));
};

export default function HomeAssistantDashboard() {
  const [layout, setLayout] = useState<CardDefinition[]>(DEFAULT_CARDS);
  const [entities, setEntities] = useState<HomeAssistantEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredLayout();
    if (stored && stored.length > 0) {
      setLayout(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    let isActive = true;
    let unsubscribe = () => {};
    let reconnectTimer: number | null = null;

    const loadInitialState = async () => {
      try {
        if (isActive) {
          setError(null);
        }

        const nextStates = await getStates();
        if (!isActive) {
          return;
        }

        setEntities(nextStates);
      } catch {
        if (isActive) {
          setError('Failed to load Home Assistant state. Check the URL and token.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    const connect = () => {
      unsubscribe = subscribeToStateChanges({
        onOpen: () => {
          if (isActive) {
            setError(null);
          }
        },
        onError: () => {
          if (isActive) {
            setError('WebSocket sync failed. Retrying connection to Home Assistant.');
          }
        },
        onClose: () => {
          if (!isActive) {
            return;
          }

          reconnectTimer = window.setTimeout(() => {
            void loadInitialState();
            connect();
          }, RECONNECT_DELAY_MS);
        },
        onStateChange: (entityId, nextState) => {
          if (!isActive) {
            return;
          }

          setEntities((current) => upsertEntity(current, entityId, nextState));
        },
      });
    };

    void loadInitialState();
    connect();

    return () => {
      isActive = false;
      unsubscribe();
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, []);

  const displayedCards = useMemo(() => {
    const entityMap = new Map(entities.map((entity) => [entity.entity_id, entity]));

    return layout
      .map((card) => {
        const entity = entityMap.get(card.entityId);
        return entity ? toDisplayEntity(card, entity) : null;
      })
      .filter((card): card is DisplayEntity => card !== null);
  }, [entities, layout]);

  const visibleEntityIds = useMemo(
    () => new Set(displayedCards.map((card) => card.entityId)),
    [displayedCards]
  );

  const availableEntities = useMemo(
    () =>
      entities
        .filter((entity) => !visibleEntityIds.has(entity.entity_id))
        .sort((a, b) => a.entity_id.localeCompare(b.entity_id))
        .slice(0, 24),
    [entities, visibleEntityIds]
  );

  const reorderCards = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) {
      return;
    }

    setLayout((current) => {
      const next = [...current];
      const sourceIndex = next.findIndex((item) => item.entityId === sourceId);
      const targetIndex = next.findIndex((item) => item.entityId === targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handlePrimaryAction = async (card: DisplayEntity) => {
    setBusyId(card.entityId);

    try {
      if (card.domain === 'climate') {
        const nextMode = card.raw.state === 'heat' ? 'off' : 'heat';
        await callService('climate', 'set_hvac_mode', {
          entity_id: card.entityId,
          hvac_mode: nextMode,
        });
      } else if (card.canToggle) {
        await toggleEntity(card.entityId);
      }
    } catch {
      setError('Failed to run the selected card action.');
    } finally {
      setBusyId(null);
    }
  };

  const addEntity = (entityId: string) => {
    if (!entityId) {
      return;
    }

    setLayout((current) => {
      if (current.some((item) => item.entityId === entityId)) {
        return current;
      }

      return [...current, { entityId, accent: '#19e2cf' }];
    });
  };

  const removeEntity = (entityId: string) => {
    setLayout((current) => current.filter((item) => item.entityId !== entityId));
  };

  const onlineCount = entities.filter((entity) => entity.state !== 'unavailable').length;

  return (
    <section className="min-h-[calc(100vh-64px)] p-5 md:p-8">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="border border-white/10 bg-white/5 p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Home Assistant Canvas
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-white">
                A custom dashboard instead of the embedded Lovelace view
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-dim)]">
                This screen reads Home Assistant entities and renders them as native cards
                in this frontend. You can reorder cards by dragging and control supported
                entities directly.
              </p>
            </div>

            <div className="border border-white/10 bg-white/5 p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Synced
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{onlineCount}</p>
              <p className="mt-2 text-sm text-[var(--text-dim)]">Available entities</p>
            </div>

            <div className="border border-white/10 bg-white/5 p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Layout
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{displayedCards.length}</p>
              <p className="mt-2 text-sm text-[var(--text-dim)]">Cards on the board</p>
            </div>
          </div>

          {error ? (
            <div className="border border-[#ff7a59]/40 bg-[#ff7a59]/10 px-4 py-3 text-sm text-[#ffd3ca]">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {displayedCards.map((card) => (
              <article
                key={card.entityId}
                draggable
                onDragStart={() => setDraggingId(card.entityId)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingId) {
                    reorderCards(draggingId, card.entityId);
                  }
                  setDraggingId(null);
                }}
                onDragEnd={() => setDraggingId(null)}
                className="group border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 transition hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center text-sm font-semibold text-[#081018]"
                      style={{ backgroundColor: card.accent }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{card.title}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEntity(card.entityId)}
                    className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-0 transition group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-3xl font-semibold text-white">{card.state}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-dim)]">
                    {card.details.length > 0 ? (
                      card.details.map((detail) => (
                        <span key={detail} className="border border-white/10 px-2 py-1">
                          {detail}
                        </span>
                      ))
                    ) : (
                      <span className="border border-white/10 px-2 py-1">
                        entity {card.entityId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={
                      (!card.canToggle && card.domain !== 'climate') ||
                      busyId === card.entityId
                    }
                    onClick={() => void handlePrimaryAction(card)}
                    className="min-w-[124px] border border-white/10 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busyId === card.entityId ? 'Working...' : card.actionLabel}
                  </button>

                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Drag to reorder
                  </span>
                </div>
              </article>
            ))}

            {!loading && displayedCards.length === 0 ? (
              <div className="border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm text-[var(--text-dim)]">
                No configured entities are available yet. Add one from the right panel.
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 border border-white/10 bg-white/5 p-5">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Entity Picker
            </p>
            <h2 className="mt-3 text-lg font-semibold text-white">Add card</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-dim)]">
              Pick a Home Assistant entity and add it to the current board. Reorder the
              board by dragging cards.
            </p>
          </div>

          <select
            className="w-full border border-white/10 bg-[rgba(9,11,18,0.95)] px-3 py-3 text-sm text-white outline-none"
            defaultValue=""
            onChange={(event) => {
              addEntity(event.target.value);
              event.target.value = '';
            }}
          >
            <option value="" disabled>
              Select an entity to add
            </option>
            {availableEntities.map((entity) => (
              <option key={entity.entity_id} value={entity.entity_id}>
                {entity.attributes.friendly_name ?? entity.entity_id}
              </option>
            ))}
          </select>

          <div className="border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Current Flow
            </p>
            <ul className="mt-3 space-y-3 text-sm text-[var(--text-dim)]">
              <li>Load `/api/states` once for the initial snapshot</li>
              <li>Subscribe to `state_changed` over the HA WebSocket API</li>
              <li>Map entities into a frontend card model</li>
              <li>Run control actions through Home Assistant service calls</li>
              <li>Persist card order in browser localStorage</li>
            </ul>
          </div>

          <div className="border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[var(--text-dim)]">
            Live entity updates now come from Home Assistant WebSocket subscriptions.
          </div>
        </aside>
      </div>
    </section>
  );
}
