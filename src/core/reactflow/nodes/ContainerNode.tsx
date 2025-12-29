import { type NodeProps } from '@xyflow/react';
import { useCallback } from 'react';
import type { ContainerNodeType } from '../../diagram/types';
import { toneToColor } from '../../diagram/theme';
import { HiddenHandles } from './HiddenHandles';
import './styles.css';

export function ContainerNode({ id, data, selected }: NodeProps<ContainerNodeType>) {
  const accent = toneToColor(data.tone ?? 'muted');
  const isCollapsed = data.expanded === false;
  const handleOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      window.dispatchEvent(new CustomEvent('container:open', { detail: { id } }));
    },
    [id]
  );

  return (
    <div
      className="diagram-container"
      style={{
        borderColor: accent,
        boxShadow: selected ? `0 0 0 2px ${accent}22, var(--diagram-card-shadow)` : undefined,
        position: 'relative',
      }}
    >
      {isCollapsed ? (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <button
            onClick={handleOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              padding: 0,
              border: `1px solid ${accent}`,
              background: 'transparent',
              color: accent,
              cursor: 'pointer',
              fontWeight: 700,
              flexShrink: 0,
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            <span role="img" aria-label="zoom">
              🔍
            </span>
          </button>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minWidth: 0,
            }}
          >
            <span
              className="diagram-card__title"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                textAlign: 'center',
                fontSize: '20px',
                lineHeight: 1.1,
              }}
            >
              {data.title}
            </span>
            {data.description ? (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--diagram-text-muted)',
                  textAlign: 'center',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.description}
              </span>
            ) : null}
            {typeof data.childCount === 'number' && data.childCount > 0 ? (
              <span style={{ fontSize: 10, opacity: 0.7 }}></span>
            ) : null}
            {data.badge ? (
              <span className="diagram-badge" style={{ borderColor: accent, color: accent }}>
                {data.badge}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="diagram-container__header" style={{ alignItems: 'flex-start', gap: 8 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <div className="diagram-card__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {data.title}
                </span>
              </div>
              {data.subtitle ? <div className="diagram-card__subtitle">{data.subtitle}</div> : null}
            </div>
            {data.badge ? (
              <span className="diagram-badge" style={{ borderColor: accent, color: accent }}>
                {data.badge}
              </span>
            ) : null}
          </div>
          {data.description ? <div className="diagram-container__body">{data.description}</div> : null}
        </>
      )}

      <HiddenHandles />
    </div>
  );
}
