'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HomeAssistantEntity,
  callService,
  getStates,
  toggleEntity,
} from '../HA_API/api';

type OverlayCardConfig = {
  entityId: string;
  title?: string;
  accent: string;
  x: number;
  y: number;
};

type HomeAssistantOverlayCardsProps = {
  cards: OverlayCardConfig[];
  storageKey?: string;
};

type DisplayCard = {
  entityId: string;
  title: string;
  domain: string;
  state: string;
  details: string[];
  actionLabel: string;
  canToggle: boolean;
  accent: string;
  raw: HomeAssistantEntity;
};

type CardPosition = {
  x: number;
  y: number;
};

const POLL_INTERVAL_MS = 15000;
const DEFAULT_STORAGE_KEY = 'vtuber-overlay-card-positions-v1';
const CARD_WIDTH = 240;

const formatState = (entity: HomeAssistantEntity) => {
  const unit = entity.attributes.unit_of_measurement;
  return unit ? `${entity.state} ${unit}` : entity.state;
};

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

const canToggleDomain = (domain: string) =>
  ['light', 'switch', 'fan', 'input_boolean', 'humidifier'].includes(domain);

const getActionLabel = (entity: HomeAssistantEntity) => {
  const [domain] = entity.entity_id.split('.');

  if (domain === 'climate') {
    return 'Set mode';
  }

  return entity.state === 'on' ? 'Turn off' : 'Turn on';
};

const humanizeEntityId = (entityId: string) =>
  entityId
    .split('.')
    .pop()
    ?.split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ') ?? entityId;

const readStoredPositions = (storageKey: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Record<string, CardPosition>;
  } catch {
    return null;
  }
};

export default function HomeAssistantOverlayCards({
  cards,
  storageKey = DEFAULT_STORAGE_KEY,
}: HomeAssistantOverlayCardsProps) {
  const [entities, setEntities] = useState<HomeAssistantEntity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, CardPosition>>({});
  const [positionsReady, setPositionsReady] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<CardPosition>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readStoredPositions(storageKey);
    if (stored) {
      setPositions(stored);
      setPositionsReady(true);
      return;
    }

    const initial = Object.fromEntries(
      cards.map((card) => [card.entityId, { x: card.x, y: card.y }])
    );
    setPositions(initial);
    setPositionsReady(true);
  }, [cards, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !positionsReady) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(positions));
  }, [positions, positionsReady, storageKey]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const nextStates = await getStates();
        if (mounted) {
          setEntities(nextStates);
          setError(null);
        }
      } catch {
        if (mounted) {
          setError('Home Assistant connection failed.');
        }
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingId || !containerRef.current) {
        return;
      }

      const bounds = containerRef.current.getBoundingClientRect();
      const nextX = Math.min(
        Math.max(0, event.clientX - bounds.left - dragOffset.x),
        Math.max(0, bounds.width - CARD_WIDTH)
      );
      const nextY = Math.max(0, event.clientY - bounds.top - dragOffset.y);

      setPositions((current) => ({
        ...current,
        [draggingId]: { x: nextX, y: nextY },
      }));
    };

    const handlePointerUp = () => {
      setDraggingId(null);
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragOffset.x, dragOffset.y, draggingId]);

  const displayCards = useMemo(() => {
    const entityMap = new Map(entities.map((entity) => [entity.entity_id, entity]));

    return cards
      .map((card) => {
        const entity = entityMap.get(card.entityId);

        if (!entity) {
          return null;
        }

        const [domain] = entity.entity_id.split('.');

        return {
          entityId: entity.entity_id,
          title: card.title ?? entity.attributes.friendly_name ?? humanizeEntityId(entity.entity_id),
          domain,
          state: formatState(entity),
          details: buildDetails(entity),
          actionLabel: getActionLabel(entity),
          canToggle: canToggleDomain(domain),
          accent: card.accent,
          raw: entity,
        } satisfies DisplayCard;
      })
      .filter((card): card is DisplayCard => card !== null);
  }, [cards, entities]);

  const handleAction = async (card: DisplayCard) => {
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

      const nextStates = await getStates();
      setEntities(nextStates);
    } catch {
      setError('Failed to run card action.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-20">
      {error ? (
        <div className="pointer-events-auto absolute left-4 right-4 top-4 z-30 mx-auto max-w-xl border border-[#ff7a59]/40 bg-[#ff7a59]/10 px-4 py-3 text-sm text-[#ffd3ca]">
          {error}
        </div>
      ) : null}

      {displayCards.map((card) => {
        const position = positions[card.entityId] ?? { x: 24, y: 24 };

        return (
          <article
            key={card.entityId}
            className="pointer-events-auto absolute z-20 w-[240px] border border-white/12 bg-[rgba(6,10,18,0.78)] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            style={{ left: position.x, top: position.y }}
          >
            <div
              onPointerDown={(event) => {
                const rect = event.currentTarget.parentElement?.getBoundingClientRect();
                if (!rect) {
                  return;
                }

                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                document.body.style.userSelect = 'none';
                setDraggingId(card.entityId);
                setDragOffset({
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                });
              }}
              className="mb-4 flex cursor-grab select-none touch-none items-start justify-between gap-3 active:cursor-grabbing"
            >
              <div>
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {card.domain}
                </p>
              </div>
              <div className="h-10 w-2 rounded-full" style={{ backgroundColor: card.accent }} />
            </div>

            <p className="text-2xl font-semibold text-white">{card.state}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-dim)]">
              {card.details.length > 0 ? (
                card.details.map((detail) => (
                  <span key={detail} className="border border-white/10 px-2 py-1">
                    {detail}
                  </span>
                ))
              ) : (
                <span className="border border-white/10 px-2 py-1">entity {card.entityId}</span>
              )}
            </div>

            <button
              type="button"
              disabled={(!card.canToggle && card.domain !== 'climate') || busyId === card.entityId}
              onClick={() => void handleAction(card)}
              className="mt-5 w-full border border-white/10 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busyId === card.entityId ? 'Working...' : card.actionLabel}
            </button>
          </article>
        );
      })}
    </div>
  );
}
