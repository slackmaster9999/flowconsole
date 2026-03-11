export type ConnectionKind = 'sync' | 'async' | 'event' | 'dependency';
export type ComponentTone = 'primary' | 'muted' | 'success' | 'warning' | 'danger';

export class ConnectionOptions {
  detail?: string;
  kind?: ConnectionKind;
  icon?: string;
  muted?: boolean;
};

export type ParentContainer = Container | ComputerSystem;

export interface ComponentArgs {
  readonly id?: string, 
  readonly name?: string, 
  readonly description?: string, 
  readonly belongsTo?: ParentContainer, 
  readonly tags?: string[], 
  readonly badge?: string, 
  readonly tone?: ComponentTone
}

export interface UserArgs extends ComponentArgs {
  readonly role?: string;
}

export class Component {

  id?: string;
  name?: string;
  description?: string;
  belongsTo?: ParentContainer;
  root?: ParentContainer;
  tags?: string[];
  badge?: string;
  tone?: ComponentTone;

  constructor(args: ComponentArgs) {
    this.id = args.id;
    this.name = args.name;
    this.description = args.description;
    this.belongsTo = args.belongsTo;
    this.tags = args.tags;
    this.badge = args.badge;
    this.tone = args.tone;
  }
  
  public sendsRequest(target: Component, label: string, options?: ConnectionOptions): Component{
    return target;
  }

  public then(target: Component): Component
  {
    return target
  }
  
  public getDataFrom(target: Component, label: string, options?: ConnectionOptions): Component
  {
    return target;
  };

  executesRequest?(action: string): Component
  {
    return this;
  }
}

export class User extends Component {
  role?: string;

  constructor(args: UserArgs) {
    super(args);
    this.role = args.role;
  }
}

export class ComputerSystem extends Component {
  domain?: string;
}

export class Container extends Component {
  technology?: string;
}

export class ReactApp extends Component {
  framework?: string;
  url?: string;
}

export class RestApi extends Component {
  method?: string;
  endpoint?: string;
}

export class Redis extends Component {
  cluster?: string;
}

export class Postgres extends Component {
  schema?: string;
}

export class KafkaTopic extends Component {
  partitionCount?: number;
}

export class MessageQueue extends Component {
  throughput?: string;
}

export class ExternalService extends Component {
  vendor?: string;
}

export class BackgroundJob extends Component {
  schedule?: string;
}