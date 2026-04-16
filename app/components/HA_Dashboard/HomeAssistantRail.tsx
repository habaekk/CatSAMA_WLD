'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  HomeAssistantEntity,
  callService,
  getStates,
  toggleEntity,
} from '../HA_API/api';

type HomeAssistantRailProps = {
  title: string;
  subtitle: string;
  entityIds: string[];
  accent: string;
};

type DisplayEntity = {
  entityId: string;
  title: string;
  domain: string;
  state: string;
  details: string[];
  canToggle: boolean;
  actionLabel: string;
  raw: HomeAssistantEntity;
};

const POLL_INTERVAL_MS = 15000;

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

const canToggleDomain = (domain: string) =>
  ['light', 'switch', 'fan', 'input_boolean', 'humidifier'].includes(domain);

const getActionLabel = (entity: HomeAssistantEntity) => {
  const [domain] = entity.entity_id.split('.');

  if (domain === 'climate') {
    return 'Set mode';
  }

  return entity.state === 'on' ? 'Turn off' : 'Turn on';
};

export default function HomeAssistantRail({
  title,
  subtitle,
  entityIds,
  accent,
}: HomeAssistantRailProps) {
  const [entities, setEntities] = useState<HomeAssistantEntity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const cards = useMemo(() => {
    const entityMap = new Map(entities.map((entity) => [entity.entity_id, entity]));

    return entityIds
      .map((entityId) => {
        const entity = entityMap.get(entityId);

        if (!entity) {
          return null;
        }

        const [domain] = entity.entity_id.split('.');

        return {
          entityId: entity.entity_id,
          title: entity.attributes.friendly_name ?? humanizeEntityId(entity.entity_id),
          domain,
          state: formatState(entity),
          details: buildDetails(entity),
          canToggle: canToggleDomain(domain),
          actionLabel: getActionLabel(entity),
          raw: entity,
        } satisfies DisplayEntity;
      })
      .filter((card): card is DisplayEntity => card !== null);
  }, [entities, entityIds]);

  const handleAction = async (card: DisplayEntity) => {
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
    <aside className="flex h-full min-h-0 flex-col border border-white/10 bg-[rgba(8,11,18,0.55)]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
          {subtitle}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {error ? (
          <div className="border border-[#ff7a59]/40 bg-[#ff7a59]/10 px-3 py-2 text-sm text-[#ffd3ca]">
            {error}
          </div>
        ) : null}

        {cards.map((card) => (
          <article key={card.entityId} className="border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {card.domain}
                </p>
              </div>
              <div className="h-9 w-2 rounded-full" style={{ backgroundColor: accent }} />
            </div>

            <p className="mt-5 text-2xl font-semibold text-white">{card.state}</p>

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
        ))}

        {cards.length === 0 ? (
          <div className="border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm text-[var(--text-dim)]">
            No matching entities were found for this panel.
          </div>
        ) : null}
      </div>
    </aside>
  );
}
