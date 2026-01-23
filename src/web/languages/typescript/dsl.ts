export const DSL_DECLARATIONS = `type ConnectionKind = 'sync' | 'async' | 'event' | 'dependency';
type ComponentTone = 'primary' | 'muted' | 'success' | 'warning' | 'danger';

class ConnectionOptions {
  detail?: string;
  kind?: ConnectionKind;
  icon?: string;
  muted?: boolean;
};

type ParentContainer = Container | ComputerSystem;

interface ComponentArgs {
  readonly id?: string, 
  readonly name?: string, 
  readonly description?: string, 
  readonly belongsTo?: ParentContainer, 
  readonly tags?: string[], 
  readonly badge?: string, 
  readonly tone?: ComponentTone
}

interface UserArgs extends ComponentArgs {
  readonly role?: string;
}

class Component {

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

class User extends Component {
  role?: string;

  constructor(args: UserArgs) {
    super(args);
    this.role = args.role;
  }
}

class ComputerSystem extends Component {
  domain?: string;
}

class Container extends Component {
  technology?: string;
}

class ReactApp extends Component {
  framework?: string;
  url?: string;
}

class RestApi extends Component {
  method?: string;
  endpoint?: string;
}

class Redis extends Component {
  cluster?: string;
}

class Postgres extends Component {
  schema?: string;
}

class KafkaTopic extends Component {
  partitionCount?: number;
}

class MessageQueue extends Component {
  throughput?: string;
}

class ExternalService extends Component {
  vendor?: string;
}

class BackgroundJob extends Component {
  schedule?: string;
}
`;
