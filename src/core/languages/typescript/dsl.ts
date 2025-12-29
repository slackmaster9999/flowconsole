export const DSL_DECLARATIONS = `
type ConnectionKind = 'sync' | 'async' | 'event' | 'dependency';

type ConnectionOptions = {
  detail?: string;
  kind?: ConnectionKind;
  icon?: string;
  muted?: boolean;
};

interface FlowSegment {
  then?(entity: DiagramEntity): FlowSegment;
  sendsRequestTo?(target: DiagramEntity, label: string, options?: ConnectionOptions): FlowSegment;
  getDataFrom?(target: DiagramEntity, label: string, options?: ConnectionOptions): FlowSegment;
  executesRequest?(action: string, options?: ConnectionOptions): FlowSegment;
  inParallel?(...branches: Array<() => FlowSegment | void>): FlowSegment;
}

type ParentContainer = Container | ComputerSystem;

interface DiagramEntity {
  id?: string;
  name: string;
  description?: string;
  belongsTo?: ParentContainer;
  system?: ParentContainer;
  tags?: string[];
  badge?: string;
  tone?: 'primary' | 'muted' | 'success' | 'warning' | 'danger';
  sendsRequestTo?(target: DiagramEntity, label: string, options?: ConnectionOptions): FlowSegment;
  getDataFrom?(target: DiagramEntity, label: string, options?: ConnectionOptions): FlowSegment;
  executesRequest?(action: string, options?: ConnectionOptions): FlowSegment;
}

interface User extends DiagramEntity {
  persona?: string;
}

interface ComputerSystem extends DiagramEntity {
  domain?: string;
}

interface Container extends DiagramEntity {
  technology?: string;
}

interface ReactApp extends DiagramEntity {
  framework?: string;
  url?: string;
}

interface RestApi extends DiagramEntity {
  method?: string;
  endpoint?: string;
}

interface Redis extends DiagramEntity {
  cluster?: string;
}

interface Postgres extends DiagramEntity {
  schema?: string;
}

interface KafkaTopic extends DiagramEntity {
  partitionCount?: number;
}

interface MessageQueue extends DiagramEntity {
  throughput?: string;
}

interface ExternalService extends DiagramEntity {
  vendor?: string;
}

interface BackgroundJob extends DiagramEntity {
  schedule?: string;
}

declare function __createEntity<T>(type: string, value: T): T;
`;
