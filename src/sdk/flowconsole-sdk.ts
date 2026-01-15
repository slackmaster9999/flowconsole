export type ConnectionKind = 'sync' | 'async' | 'event' | 'dependency';

export class ConnectionOptions {
  detail?: string;
  kind?: ConnectionKind;
  icon?: string;
  muted?: boolean;
};

export type ParentContainer = Container | ComputerSystem;

export class Component {

  id?: string;
  name?: string;
  description?: string;
  belongsTo?: ParentContainer;
  root?: ParentContainer;
  tags?: string[];
  badge?: string;
  tone?: 'primary' | 'muted' | 'success' | 'warning' | 'danger';
  
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

  constructor(name?: string, role?: string) {
    super();
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