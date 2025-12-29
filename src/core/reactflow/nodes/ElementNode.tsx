import { type NodeProps } from '@xyflow/react';
import type { ElementNodeType } from '../../diagram/types';
import { toneToColor } from '../../diagram/theme';
import { HiddenHandles } from './HiddenHandles';

const shapeGlyph: Record<string, string> = {
  person: '👤',
  service: '⚙️',
  database: '🗄️',
  queue: '≋',
  storage: '🗂️',
  boundary: '⬒',
};

function statusColor(status: ElementNodeType['data']['status']) {
  switch (status) {
    case 'operational':
      return 'var(--diagram-success)';
    case 'degraded':
      return 'var(--diagram-warning)';
    case 'down':
      return 'var(--diagram-danger)';
    default:
      return 'var(--diagram-muted)';
  }
}

export function ElementNode({ data, selected }: NodeProps<ElementNodeType>) {
  const accent = toneToColor(data.tone);
  const glyph = shapeGlyph[data.shape ?? 'service'] ?? '⬢';

  return (
    <div
      className="diagram-card"
      style={{
        borderColor: accent,
        boxShadow: selected ? `0 0 0 2px ${accent}33, var(--diagram-card-shadow)` : undefined,
      }}
    >
      <div className="diagram-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="diagram-icon" style={{ borderColor: accent }}>
            {data.icon ?? glyph}
          </div>
          <div>
            <div className="diagram-card__title">{data.title}</div>
            {data.subtitle ? <div className="diagram-card__subtitle">{data.subtitle}</div> : null}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {data.badge ? (
            <span className="diagram-badge" style={{ borderColor: accent, color: accent }}>
              {data.badge}
            </span>
          ) : null}
          <span className="diagram-status" style={{ background: statusColor(data.status) }} />
        </div>
      </div>
      {data.description ? (
        <div style={{ color: 'var(--diagram-text-muted)', fontSize: 13, lineHeight: 1.4 }}>
          {data.description}
        </div>
      ) : null}
      {data.tags?.length ? (
        <div className="diagram-card__tags">
          {data.tags.map((tag: string) => (
            <span key={tag} className="diagram-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <HiddenHandles />
    </div>
  );
}
