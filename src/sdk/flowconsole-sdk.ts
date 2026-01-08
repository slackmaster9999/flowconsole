export type ConnectionKind = 'sync' | 'async' | 'event' | 'dependency';

export type ConnectionOptions = {
  detail?: string;
  kind?: ConnectionKind;
  icon?: string;
  muted?: boolean;
};

export type ParentContainer = Container | ComputerSystem;

export interface Component {
  id?: string;
  name: string;
  description?: string;
  belongsTo?: ParentContainer;
  system?: ParentContainer;
  tags?: string[];
  badge?: string;
  tone?: 'primary' | 'muted' | 'success' | 'warning' | 'danger';
  sendsRequestTo?(target: Component, label: string, options?: ConnectionOptions): Component;
  getDataFrom?(target: Component, label: string, options?: ConnectionOptions): Component;
  executesRequest?(action: string, options?: ConnectionOptions): Component;
}

export interface User extends Component {
  persona?: string;
}

export interface ComputerSystem extends Component {
  domain?: string;
}

export interface Container extends Component {
  technology?: string;
}

export interface ReactApp extends Component {
  framework?: string;
  url?: string;
}

export interface RestApi extends Component {
  method?: string;
  endpoint?: string;
}

export interface Redis extends Component {
  cluster?: string;
}

export interface IPostgres extends Component {
  schema?: string;
}

export interface IKafkaTopic extends Component {
  partitionCount?: number;
}

export interface IMessageQueue extends Component {
  throughput?: string;
}

export interface IExternalService extends Component {
  vendor?: string;
}

export interface IBackgroundJob extends Component {
  schedule?: string;
}