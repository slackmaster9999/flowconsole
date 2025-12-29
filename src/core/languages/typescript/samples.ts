import type { CodeSample } from '../types';

export const codeSamples: CodeSample[] = [
  {
    id: 'retail-banking',
    title: 'Retail Banking Platform',
    description:
      'Customer-facing banking stack with SPA frontend, backend APIs, caches, databases, and audit streams.',
    code: `const user: User = { name: "Customer", description: "Retail banking customer" };

const system: ComputerSystem = { name: "Cloud Banking" };
const storage: Container = { name: "Data Store", system: system };
const backend: Container = { name: "Core Services", system: system };

const frontApp: ReactApp = {
  name: "Customer Dashboard",
  description: "Browser Single-page Application",
  belongsTo: system
};
const authApi: RestApi = {
  name: "Authentication",
  description: "Self-Hosted Authentication Service",
  belongsTo: backend
};

const accountsApi: RestApi = {
  name: "Accounts API",
  description: "Java Spring service for balances and payments",
  belongsTo: backend
};

const cache: Redis = {
  name: "Session Cache",
  description: "Stores customer session payloads",
  belongsTo: storage
};

const db: Postgres = {
  name: "Ledger DB",
  description: "Persistent customer and transaction data",
  belongsTo: storage
};

const auditStream: KafkaTopic = {
  name: "Audit Events",
  description: "Every request produces an audit record",
  belongsTo: backend
};

const fraudService: ExternalService = {
  name: "Fraud Guard",
  description: "3rd-party fraud scoring",
  belongsTo: backend
};

user.sendsRequestTo(frontApp, "launch app")
  .then(frontApp).sendsRequestTo(authApi, "login")
  .then(frontApp).sendsRequestTo(accountsApi, "load dashboard")
  .inParallel(
    () => accountsApi.getDataFrom(cache, "session context"),
    () => accountsApi.getDataFrom(db, "account snapshot")
  )
  .sendsRequestTo(authApi, "validate token")
  .then(accountsApi)
  .inParallel(
    () => accountsApi.sendsRequestTo(auditStream, "emit audit", { kind: 'event' }),
    () => accountsApi.sendsRequestTo(fraudService, "score transaction", { kind: 'async' })
  );
`,
  },
  {
    id: 'enterprise-erp',
    title: 'Global ERP & Supply Chain',
    description:
      'Corporate ERP with employee portal, integration hub, planning services, background schedulers, and supplier APIs.',
    code: `const employee: User = { name: "Regional Planner", description: "Creates purchase orders" };
const supplier: ExternalService = { name: "Supplier API", description: "Partner integration" };

const atlas: ComputerSystem = { name: "Atlas ERP" };
const portal: ReactApp = {
  name: "Planner Portal",
  description: "Next.js dashboard for procurement team",
  belongsTo: atlas
};

const integrationHub: Container = {
  name: "Integration Hub",
  description: "Async orchestrations + adapters",
  system: atlas
};

const planningApi: RestApi = {
  name: "Planning Service",
  description: "Handles demand & supply planning",
  belongsTo: integrationHub
};

const inventoryApi: RestApi = {
  name: "Inventory Service",
  description: "Tracks warehouse stock",
  belongsTo: integrationHub
};

const workflowQueue: MessageQueue = {
  name: "Workflow Queue",
  description: "Commands for async processing",
  belongsTo: integrationHub
};

const reportingJob: BackgroundJob = {
  name: "Nightly Reconciliation",
  description: "Produces compliance extracts",
  belongsTo: integrationHub
};

const erpDb: Postgres = {
  name: "ERP Database",
  description: "Orders, forecasts, contracts",
  belongsTo: integrationHub
};

employee.sendsRequestTo(portal, "create purchase order")
  .then(portal).sendsRequestTo(planningApi, "submit plan")
  .sendsRequestTo(inventoryApi, "reserve stock")
  .inParallel(
    () => planningApi.getDataFrom(erpDb, "fetch demand"),
    () => inventoryApi.getDataFrom(erpDb, "current stock")
  )
  .sendsRequestTo(workflowQueue, "publish workflow", { kind: 'async' })
  .then(planningApi).sendsRequestTo(supplier, "send order", { kind: 'sync' });

reportingJob.sendsRequestTo(erpDb, "load data", { kind: 'dependency' })
  .executesRequest("generate nightly reports")
  .sendsRequestTo(workflowQueue, "notify portal", { kind: 'event' });
`,
  },
  {
    id: 'oss-collab',
    title: 'OSS Collaboration Platform',
    description:
      'Architecture of a large open-source dev platform with contributors, Git service, CI runners, and observability.',
    code: `const contributor: User = { name: "Contributor", description: "Sends pull requests" };
const maintainer: User = { name: "Maintainer", description: "Reviews and deploys" };

const helios: ComputerSystem = { name: "Helios OSS" };
const gitGateway: Container = { name: "Git Gateway", system: helios };
const ciCluster: Container = { name: "CI Cluster", system: helios };
const observability: Container = { name: "Observability", system: helios };

const webApp: ReactApp = {
  name: "Helios Web",
  description: "Next.js UI for issues, merge requests, pipelines",
  belongsTo: helios
};

const gitHttp: RestApi = {
  name: "Git HTTP",
  description: "Clone & push over HTTPS",
  belongsTo: gitGateway
};

const apiGateway: RestApi = {
  name: "GraphQL API",
  description: "Issues, projects, releases",
  belongsTo: gitGateway
};

const ciRunner: BackgroundJob = {
  name: "CI Runner",
  description: "Executes pipelines from queue",
  belongsTo: ciCluster
};

const pipelineQueue: MessageQueue = {
  name: "Pipeline Queue",
  description: "Jobs waiting for runners",
  belongsTo: ciCluster
};

const eventStream: KafkaTopic = {
  name: "Activity Stream",
  description: "Push events, comments, deployments",
  belongsTo: observability
};

const metricsStore: Postgres = {
  name: "Metrics Store",
  description: "Usage, billing, analytics",
  belongsTo: observability
};

contributor.sendsRequestTo(webApp, "open MR")
  .then(webApp).sendsRequestTo(apiGateway, "create merge request")
  .sendsRequestTo(gitHttp, "push commits")
  .then(apiGateway).sendsRequestTo(pipelineQueue, "enqueue pipeline", { kind: 'event' })
  .sendsRequestTo(eventStream, "publish activity", { kind: 'event' });

ciRunner.sendsRequestTo(pipelineQueue, "claim job", { kind: 'async' })
  .executesRequest("run tests")
  .sendsRequestTo(apiGateway, "update status")
  .sendsRequestTo(eventStream, "emit pipeline events", { kind: 'event' });

maintainer.sendsRequestTo(webApp, "review & deploy")
  .then(webApp).sendsRequestTo(apiGateway, "approve merge")
  .sendsRequestTo(metricsStore, "record deployment", { kind: 'dependency' })
  .then(apiGateway).sendsRequestTo(eventStream, "log deployment", { kind: 'event' });
`,
  },
  {
    id: 'media-streaming',
    title: 'Global Media Streaming Platform',
    description:
      'Consumer streaming service with device apps, control plane, data plane, recommendations, and CDN edge nodes.',
    code: `const viewer: User = { name: "Subscriber", description: "Streams movies" };
const operator: User = { name: "Ops Engineer", description: "Monitors health" };

const streamly: ComputerSystem = { name: "Streamly" };
const deviceApps: Container = { name: "Device Apps", system: streamly };
const controlPlane: Container = { name: "Control Plane", system: streamly };
const dataPlane: Container = { name: "Data Plane", system: streamly };
const observability: Container = { name: "Observability", system: streamly };

const tvApp: ReactApp = {
  name: "TV App",
  description: "Smart TV + set-top box UI",
  belongsTo: deviceApps,
};

const mobileApp: ReactApp = {
  name: "Mobile App",
  description: "iOS/Android client",
  belongsTo: deviceApps,
};

const authService: RestApi = {
  name: "Identity",
  description: "Login, entitlements",
  belongsTo: controlPlane,
};

const catalogService: RestApi = {
  name: "Catalog",
  description: "Metadata, search, personalization",
  belongsTo: controlPlane,
};

const playbackService: RestApi = {
  name: "Playback Service",
  description: "Session tokens, DRM",
  belongsTo: controlPlane,
};

const ingestPipeline: BackgroundJob = {
  name: "Content Ingest",
  description: "Transcodes uploads",
  belongsTo: dataPlane,
};

const edgeCache: ExternalService = {
  name: "Global CDN",
  description: "Edge delivery network",
  belongsTo: dataPlane,
};

const profilesStore: Postgres = {
  name: "Profiles DB",
  description: "Viewer profiles, settings",
  belongsTo: controlPlane,
};

const recommendationService: RestApi = {
  name: "Recommendations",
  description: "ML ranking service",
  belongsTo: controlPlane,
};

const watchEvents: KafkaTopic = {
  name: "Watch Events",
  description: "View, pause, seek telemetry",
  belongsTo: observability,
};

const metricsApi: RestApi = {
  name: "Metrics API",
  description: "Real-time health",
  belongsTo: observability,
};

viewer.sendsRequestTo(tvApp, "open app")
  .then(tvApp).sendsRequestTo(authService, "login")
  .then(tvApp).sendsRequestTo(catalogService, "browse catalog")
  .sendsRequestTo(recommendationService, "personal picks")
  .sendsRequestTo(playbackService, "start playback")
  .inParallel(
    () => playbackService.getDataFrom(profilesStore, "profile rights"),
    () => playbackService.sendsRequestTo(edgeCache, "issue token", { kind: 'sync' })
  )
  .sendsRequestTo(watchEvents, "emit play", { kind: 'event' });

mobileApp.sendsRequestTo(playbackService, "resume session")
  .inParallel(
    () => playbackService.getDataFrom(profilesStore, "device list"),
    () => playbackService.sendsRequestTo(edgeCache, "refresh CDN token", { kind: 'async' })
  );

ingestPipeline.sendsRequestTo(edgeCache, "push renditions", { kind: 'async' })
  .sendsRequestTo(watchEvents, "publish ingest status", { kind: 'event' });

operator.sendsRequestTo(metricsApi, "check SLOs")
  .sendsRequestTo(watchEvents, "trace anomalies", { kind: 'dependency' });
`,
  },
  {
    id: 'opensource-observability',
    title: 'Open-Source Observability Stack',
    description:
      'Community project similar to Kubernetes monitoring suites with control plane, agents, dashboards, storage tiers, and alerting.',
    code: `const platformEngineer: User = { name: "Platform Engineer", description: "Owns monitoring" };
const contributor: User = { name: "Community Dev", description: "Extends plugins" };

const skyline: ComputerSystem = { name: "Skyline Observability" };
const controlPlane: Container = { name: "Control Plane", system: skyline };
const dataLake: Container = { name: "Data Lake", system: skyline };
const dashboards: Container = { name: "Dashboards", system: skyline };
const edgeAgents: Container = { name: "Cluster Agents", system: skyline };

const kubeAgent: BackgroundJob = {
  name: "Kube Agent",
  description: "Collects metrics + logs",
  belongsTo: edgeAgents,
};

const serviceMap: RestApi = {
  name: "Service Map API",
  description: "Topology + traces",
  belongsTo: controlPlane,
};

const alertManager: RestApi = {
  name: "Alert Manager",
  description: "Rules, paging, webhooks",
  belongsTo: controlPlane,
};

const ingestGateway: RestApi = {
  name: "Ingest Gateway",
  description: "OpenTelemetry collector",
  belongsTo: controlPlane,
};

const timeseriesDb: Postgres = {
  name: "TSDB",
  description: "PromQL-compatible store",
  belongsTo: dataLake,
};

const logStore: Postgres = {
  name: "Log Store",
  description: "Columnar logs",
  belongsTo: dataLake,
};

const eventsTopic: KafkaTopic = {
  name: "Events Bus",
  description: "Alerts, deploy hooks",
  belongsTo: controlPlane,
};

const pluginRegistry: RestApi = {
  name: "Plugin Registry",
  description: "Hosts visualization plugins",
  belongsTo: dashboards,
};

const explorerUi: ReactApp = {
  name: "Explorer UI",
  description: "Dashboards + alerts",
  belongsTo: dashboards,
};

platformEngineer.sendsRequestTo(explorerUi, "inspect cluster")
  .then(explorerUi).sendsRequestTo(serviceMap, "fetch topology")
  .sendsRequestTo(alertManager, "list alerts")
  .sendsRequestTo(pluginRegistry, "load plugin")
  .sendsRequestTo(eventsTopic, "audit view", { kind: 'event' });

kubeAgent.sendsRequestTo(ingestGateway, "ship metrics", { kind: 'async' })
  .sendsRequestTo(timeseriesDb, "store metrics", { kind: 'dependency' })
  .sendsRequestTo(logStore, "store logs", { kind: 'dependency' })
  .sendsRequestTo(eventsTopic, "emit anomalies", { kind: 'event' });

serviceMap.getDataFrom(timeseriesDb, "metrics")
  .getDataFrom(logStore, "logs")
  .sendsRequestTo(alertManager, "fire alerts", { kind: 'event' });

contributor.sendsRequestTo(pluginRegistry, "publish plugin")
  .sendsRequestTo(eventsTopic, "announce release", { kind: 'event' });
`,
  },
];

export const defaultSampleId = codeSamples[0]?.id ?? 'retail-banking';
