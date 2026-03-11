export const ENTITY_TYPE_NAMES = [
  'User',
  'ComputerSystem',
  'Container',
  'ReactApp',
  'RestApi',
  'Redis',
  'Postgres',
  'KafkaTopic',
  'MessageQueue',
  'ExternalService',
  'BackgroundJob',
] as const;

export type EntityTypeName = (typeof ENTITY_TYPE_NAMES)[number];

export type ConnectionKind = 'sync' | 'async' | 'event' | 'dependency';

export type ConnectionRecord = {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  detail?: string;
  kind: ConnectionKind;
  icon?: string;
  muted?: boolean;
};

export type EntityRecord = {
  id: string;
  type: EntityTypeName;
  name: string;
  description?: string;
  parentId?: string;
  tags?: string[];
  badge?: string;
  tone?: string;
  metadata: Record<string, unknown>;
};

export type DiagramIntermediateModel = {
  entities: EntityRecord[];
  relationships: ConnectionRecord[];
  flows: FlowRecord[];
};

export type FlowStepRecord = {
  id: string;
  edgeId: string;
  sourceId: string;
  targetId: string;
  label?: string;
};

export type FlowRecord = {
  id: string;
  name?: string;
  steps: FlowStepRecord[];
};

const ENTITY_META = Symbol('diagram-entity-meta');

type EntityHandle = Record<string, unknown> & {
  [ENTITY_META]: {
    id: string;
    type: EntityTypeName;
  };
};

type ConnectionOptions = {
  detail?: string;
  kind?: ConnectionKind;
  icon?: string;
  muted?: boolean;
};

export class DiagramRuntime {
  private readonly entities = new Map<string, EntityRecord>();
  private readonly entityOrder: EntityRecord[] = [];
  private readonly connections: ConnectionRecord[] = [];
  private readonly slugCounts = new Map<string, number>();
  private edgeCounter = 0;
  private readonly flows: FlowRecord[] = [];
  private flowCounter = 0;
  private activeFlowStack: string[] = [];

  get createEntityInvoker() {
    return (typeName: EntityTypeName, value: unknown) => this.createEntity(typeName, value);
  }

  private ensureFlow(flowId: string, nameHint?: string) {
    let flow = this.flows.find((f) => f.id === flowId);
    if (!flow) {
      flow = { id: flowId, name: nameHint, steps: [] };
      this.flows.push(flow);
    } else if (!flow.name && nameHint) {
      flow.name = nameHint;
    }
    return flow;
  }

  private nextFlowId() {
    this.flowCounter += 1;
    return `flow-${this.flowCounter}`;
  }

  withActiveFlow(flowId: string, fn: () => void) {
    this.activeFlowStack.push(flowId);
    try {
      fn();
    } finally {
      this.activeFlowStack.pop();
    }
  }

  private getActiveFlowId() {
    return this.activeFlowStack[this.activeFlowStack.length - 1];
  }

  createFlowBuilder(current: EntityHandle) {
    const flowId = this.getActiveFlowId() ?? this.nextFlowId();
    this.ensureFlow(flowId);
    return new FlowBuilder(this, current, flowId);
  }

  snapshot(): DiagramIntermediateModel {
    return {
      entities: [...this.entityOrder],
      relationships: [...this.connections],
      flows: [...this.flows],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createEntity(typeName: EntityTypeName, value: unknown): any {
    if (!value || typeof value !== 'object') {
      throw new Error(`${typeName} must be defined with an object literal`);
    }

    const base = value as Record<string, unknown>;
    const name = typeof base.name === 'string' && base.name.trim() ? base.name.trim() : typeName;
    const description = typeof base.description === 'string' ? base.description : undefined;
    const tone = typeof base.tone === 'string' ? base.tone : undefined;
    const badge = typeof base.badge === 'string' ? base.badge : undefined;
    const tags = Array.isArray(base.tags)
      ? base.tags.filter((tag): tag is string => typeof tag === 'string')
      : undefined;

    const parentId = this.resolveParentId(base.belongsTo ?? base.system);
    const metadata = { ...base };
    const id = this.resolveId(typeName, base.id, name);

    const record: EntityRecord = {
      id,
      type: typeName,
      name,
      description,
      parentId,
      tags,
      badge,
      tone,
      metadata,
    };

    this.entities.set(id, record);
    this.entityOrder.push(record);

    const entityHandle = value as EntityHandle;
    Object.defineProperty(entityHandle, ENTITY_META, {
      value: { id, type: typeName },
      enumerable: false,
    });

    const flowFrom = () => this.createFlowBuilder(entityHandle);

    Object.defineProperties(entityHandle, {
      sendsRequestTo: {
        value: (target: EntityHandle, label: string, options?: ConnectionOptions) =>
          flowFrom().sendsRequestTo(target, label, options),
        enumerable: false,
      },
      getDataFrom: {
        value: (target: EntityHandle, label: string, options?: ConnectionOptions) =>
          flowFrom().getDataFrom(target, label, options),
        enumerable: false,
      },
      executesRequest: {
        value: (action: string, options?: ConnectionOptions) =>
          flowFrom().executesRequest(action, options),
        enumerable: false,
      },
    });

    return entityHandle;
  }

  private resolveParentId(candidate: unknown): string | undefined {
    if (!candidate || typeof candidate !== 'object') return undefined;
    const handle = candidate as Partial<EntityHandle>;
    return handle[ENTITY_META]?.id;
  }

  private resolveId(typeName: string, explicit: unknown, name: string) {
    if (typeof explicit === 'string' && explicit.trim()) {
      return explicit.trim();
    }

    const slugBase = slugify(name || typeName);
    const count = this.slugCounts.get(slugBase) ?? 0;
    this.slugCounts.set(slugBase, count + 1);
    return count === 0 ? slugBase : `${slugBase}-${count + 1}`;
  }

  addConnection(
    source: EntityHandle,
    target: EntityHandle,
    label: string,
    kind: ConnectionKind,
    detail?: string,
    options?: ConnectionOptions
  ) {
    const sourceId = source[ENTITY_META]?.id;
    const targetId = target[ENTITY_META]?.id;
    if (!sourceId || !targetId) return '';
    this.edgeCounter += 1;
    const id = `rel-${this.edgeCounter}`;
    this.connections.push({
      id,
      sourceId,
      targetId,
      label,
      detail,
      kind,
      icon: options?.icon,
      muted: options?.muted,
    });
    return id;
  }

  addFlowStep(
    flowId: string,
    step: { edgeId: string; sourceId: string; targetId: string; label?: string }
  ) {
    const flow = this.ensureFlow(flowId, step.label);
    const stepId = `${flowId}-step-${flow.steps.length + 1}`;
    flow.steps.push({ id: stepId, ...step });
    return stepId;
  }
}

class FlowBuilder {
  private runtime: DiagramRuntime;
  private current: EntityHandle;
  private flowId: string;

  constructor(runtime: DiagramRuntime, current: EntityHandle, flowId: string) {
    this.runtime = runtime;
    this.current = current;
    this.flowId = flowId;
  }

  then(entity: EntityHandle) {
    this.current = entity;
    return this;
  }

  sendsRequestTo(target: EntityHandle, label: string, options?: ConnectionOptions) {
    const finalLabel = label ?? 'request';
    const edgeId = this.runtime.addConnection(
      this.current,
      target,
      finalLabel,
      options?.kind ?? 'sync',
      options?.detail,
      options
    );
    this.runtime.addFlowStep(this.flowId, {
      edgeId,
      sourceId: this.current[ENTITY_META]?.id ?? '',
      targetId: target[ENTITY_META]?.id ?? '',
      label: finalLabel,
    });
    this.current = target;
    return this;
  }

  getDataFrom(target: EntityHandle, label: string, options?: ConnectionOptions) {
    const finalLabel = label ?? 'data';
    const edgeId = this.runtime.addConnection(
      this.current,
      target,
      finalLabel,
      options?.kind ?? 'dependency',
      options?.detail,
      options
    );
    this.runtime.addFlowStep(this.flowId, {
      edgeId,
      sourceId: this.current[ENTITY_META]?.id ?? '',
      targetId: target[ENTITY_META]?.id ?? '',
      label: finalLabel,
    });
    return this;
  }

  executesRequest(action: string, options?: ConnectionOptions) {
    const finalLabel = action ?? 'action';
    const edgeId = this.runtime.addConnection(
      this.current,
      this.current,
      finalLabel,
      options?.kind ?? 'event',
      options?.detail,
      options
    );
    this.runtime.addFlowStep(this.flowId, {
      edgeId,
      sourceId: this.current[ENTITY_META]?.id ?? '',
      targetId: this.current[ENTITY_META]?.id ?? '',
      label: finalLabel,
    });
    return this;
  }

  inParallel(...branches: Array<() => FlowBuilder | void>) {
    this.runtime.withActiveFlow(this.flowId, () => {
      branches.forEach((branch) => {
        try {
          const result = branch();
          if (result instanceof FlowBuilder) {
            // nothing special right now, but allows chaining for user
          }
        } catch (error) {
          console.warn('Parallel branch failed', error);
        }
      });
    });
    return this;
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
