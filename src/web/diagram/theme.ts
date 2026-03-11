import type { ElementTone, RelationshipKind } from './types';

export function toneToColor(tone: ElementTone = 'primary') {
  switch (tone) {
    case 'success':
      return 'var(--diagram-success)';
    case 'warning':
      return 'var(--diagram-warning)';
    case 'danger':
      return 'var(--diagram-danger)';
    case 'muted':
      return 'var(--diagram-muted)';
    default:
      return 'var(--diagram-primary)';
  }
}

export function relationshipStroke(kind: RelationshipKind = 'dependency') {
  switch (kind) {
    case 'sync':
      return { stroke: toneToColor('primary'), strokeDasharray: undefined };
    case 'async':
      return { stroke: toneToColor('success'), strokeDasharray: '6 6' };
    case 'event':
      return { stroke: toneToColor('warning'), strokeDasharray: '2 6' };
    default:
      return { stroke: toneToColor('muted'), strokeDasharray: undefined };
  }
}
