/**
 * ErIDL - ErSlice Interface Definition Language
 * ErSlice 獨創的設計驅動介面定義語言
 * 
 * 核心理念：
 * - 設計驅動：以設計稿為核心的開發流程
 * - 全棧覆蓋：從前端到後端的完整定義
 * - AI 友善：便於 AI 理解和代碼生成
 * - 框架無關：支援多種技術棧
 */

import { ErComponent, Framework } from './erComponent';

// ===== 基礎類型定義 =====

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'widescreen';
export type InteractionType = 'click' | 'hover' | 'focus' | 'input' | 'scroll' | 'swipe' | 'drag';
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'elastic' | 'custom';
export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'file' | 'image';
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'redis' | 'elasticsearch';
export type DeploymentTarget = 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'docker' | 'kubernetes';

// ===== 設計層定義 =====

export interface ScreenDefinition {
  id: string;
  name: string;
  description: string;
  figmaNodeId?: string;
  figmaUrl?: string;
  size: ScreenSize;
  dimensions: {
    width: number;
    height: number;
  };
  components: string[]; // ErComponent IDs
  layout: LayoutDefinition;
  interactions: InteractionDefinition[];
  responsiveVariants?: {
    size: ScreenSize;
    adaptations: LayoutAdaptation[];
  }[];
}

export interface ComponentDefinition {
  id: string;
  erComponentId: string; // 關聯到 ErComponent
  instanceName: string;
  props: Record<string, any>;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  constraints: LayoutConstraints;
  variations?: ComponentVariation[];
}

export interface LayoutDefinition {
  type: 'flex' | 'grid' | 'absolute' | 'flow';
  direction?: 'row' | 'column';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: number;
  columns?: number;
  rows?: number;
  areas?: string[][];
}

export interface LayoutConstraints {
  top?: ConstraintDefinition;
  right?: ConstraintDefinition;
  bottom?: ConstraintDefinition;
  left?: ConstraintDefinition;
  width?: SizeConstraint;
  height?: SizeConstraint;
  aspectRatio?: number;
}

export interface ConstraintDefinition {
  type: 'fixed' | 'stretch' | 'center' | 'scale';
  value?: number;
  target?: string; // 參考元素 ID
}

export interface SizeConstraint {
  type: 'fixed' | 'fill' | 'hug' | 'min' | 'max';
  value?: number;
  min?: number;
  max?: number;
}

export interface LayoutAdaptation {
  property: string;
  from: any;
  to: any;
  breakpoint?: number;
}

export interface ComponentVariation {
  name: string;
  condition: string;
  props: Record<string, any>;
  style?: Record<string, any>;
}

export interface InteractionDefinition {
  id: string;
  name: string;
  trigger: {
    type: InteractionType;
    target: string; // 組件 ID
    condition?: string;
  };
  action: {
    type: 'navigate' | 'animate' | 'state-change' | 'api-call' | 'custom';
    parameters: Record<string, any>;
  };
  animation?: AnimationDefinition;
  feedback?: FeedbackDefinition;
}

export interface AnimationDefinition {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing: string;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  keyframes?: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  offset: number; // 0-1
  properties: Record<string, any>;
}

export interface FeedbackDefinition {
  type: 'visual' | 'haptic' | 'audio' | 'notification';
  config: Record<string, any>;
}

export interface DesignTokenDefinition {
  id: string;
  name: string;
  category: 'color' | 'typography' | 'spacing' | 'shadow' | 'border' | 'animation' | 'breakpoint';
  value: any;
  description?: string;
  usage: string[];
  references?: string[]; // 使用此 token 的組件或元素
}

// ===== 業務層定義 =====

export interface EntityDefinition {
  id: string;
  name: string;
  description: string;
  attributes: AttributeDefinition[];
  relationships: RelationshipDefinition[];
  validations: ValidationRule[];
  permissions: PermissionRule[];
  lifecycle?: EntityLifecycle;
}

export interface AttributeDefinition {
  name: string;
  type: DataType;
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  constraints?: AttributeConstraint[];
  description?: string;
}

export interface AttributeConstraint {
  type: 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value: any;
  message?: string;
}

export interface RelationshipDefinition {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string; // Entity ID
  foreignKey?: string;
  cascade?: boolean;
  required?: boolean;
}

export interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
  when?: string; // 條件表達式
}

export interface PermissionRule {
  action: 'create' | 'read' | 'update' | 'delete';
  role: string;
  condition?: string;
}

export interface EntityLifecycle {
  states: string[];
  transitions: StateTransition[];
  hooks?: LifecycleHook[];
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  condition?: string;
  action?: string;
}

export interface LifecycleHook {
  event: 'before-create' | 'after-create' | 'before-update' | 'after-update' | 'before-delete' | 'after-delete';
  action: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  variables?: WorkflowVariable[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'user-task' | 'service-task' | 'decision' | 'parallel' | 'subprocess';
  config: Record<string, any>;
  conditions?: StepCondition[];
  nextSteps: string[];
}

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  config: Record<string, any>;
}

export interface WorkflowVariable {
  name: string;
  type: DataType;
  scope: 'global' | 'step' | 'user';
  defaultValue?: any;
}

export interface StepCondition {
  expression: string;
  nextStep: string;
}

export interface UserJourneyDefinition {
  id: string;
  name: string;
  description: string;
  persona: string;
  goal: string;
  stages: JourneyStage[];
  touchpoints: Touchpoint[];
  metrics: JourneyMetric[];
}

export interface JourneyStage {
  id: string;
  name: string;
  description: string;
  actions: string[];
  emotions: string[];
  painPoints: string[];
  opportunities: string[];
  screens?: string[]; // Screen IDs
}

export interface Touchpoint {
  id: string;
  stage: string;
  channel: 'web' | 'mobile' | 'email' | 'sms' | 'phone' | 'social';
  interaction: string;
  goal: string;
}

export interface JourneyMetric {
  name: string;
  type: 'conversion' | 'time' | 'satisfaction' | 'completion';
  target: number;
  current?: number;
}

export interface BusinessRuleDefinition {
  id: string;
  name: string;
  description: string;
  category: 'validation' | 'calculation' | 'workflow' | 'security' | 'compliance';
  condition: string;
  action: string;
  priority: number;
  active: boolean;
}

// ===== 技術層定義 =====

export interface ArchitectureDefinition {
  frontend: FrontendArchitecture;
  backend: BackendArchitecture;
  database: DatabaseArchitecture;
  infrastructure: InfrastructureArchitecture;
  integrations: IntegrationDefinition[];
}

export interface FrontendArchitecture {
  framework: Framework;
  buildTool: 'vite' | 'webpack' | 'rollup' | 'esbuild';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  styling: 'css' | 'scss' | 'styled-components' | 'emotion' | 'tailwind' | 'chakra';
  stateManagement: 'redux' | 'zustand' | 'recoil' | 'context' | 'pinia' | 'vuex';
  routing: 'react-router' | 'next-router' | 'vue-router' | 'reach-router';
  testing: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'testing-library';
  linting: 'eslint' | 'prettier' | 'tslint';
  typeScript: boolean;
}

export interface BackendArchitecture {
  framework: 'express' | 'fastify' | 'koa' | 'nest' | 'django' | 'flask' | 'spring' | 'laravel';
  language: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'go' | 'rust' | 'php';
  database: DatabaseType;
  authentication: 'jwt' | 'oauth' | 'session' | 'firebase-auth' | 'auth0' | 'cognito';
  apiStyle: 'rest' | 'graphql' | 'grpc' | 'websocket';
  caching: 'redis' | 'memcached' | 'in-memory' | 'none';
  queues: 'bull' | 'agenda' | 'kue' | 'rabbitmq' | 'kafka' | 'none';
  logging: 'winston' | 'pino' | 'bunyan' | 'morgan';
}

export interface DatabaseArchitecture {
  primary: DatabaseType;
  replicas?: DatabaseType[];
  migrations: boolean;
  seeding: boolean;
  backup: BackupStrategy;
  indexing: IndexStrategy[];
}

export interface BackupStrategy {
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // days
  location: 'local' | 's3' | 'gcs' | 'azure';
}

export interface IndexStrategy {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  unique?: boolean;
}

export interface InfrastructureArchitecture {
  hosting: DeploymentTarget;
  containerization: 'docker' | 'podman' | 'none';
  orchestration: 'kubernetes' | 'docker-swarm' | 'ecs' | 'none';
  cdn: 'cloudflare' | 'aws-cloudfront' | 'gcp-cdn' | 'azure-cdn' | 'none';
  monitoring: 'prometheus' | 'datadog' | 'newrelic' | 'sentry';
  security: SecurityConfiguration;
}

export interface SecurityConfiguration {
  ssl: boolean;
  firewall: boolean;
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
  helmet: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

export interface CorsConfig {
  origin: string[] | string | boolean;
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'queue' | 'storage' | 'auth' | 'payment' | 'email';
  provider: string;
  config: Record<string, any>;
  authentication?: IntegrationAuth;
  rateLimits?: RateLimitConfig;
}

export interface IntegrationAuth {
  type: 'api-key' | 'oauth' | 'basic' | 'bearer' | 'custom';
  config: Record<string, any>;
}

export interface APIDefinition {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  version: string;
  endpoints: EndpointDefinition[];
  authentication: APIAuthentication;
  rateLimit?: RateLimitConfig;
  documentation?: APIDocumentation;
}

export interface EndpointDefinition {
  id: string;
  path: string;
  method: HTTPMethod;
  description: string;
  parameters?: ParameterDefinition[];
  requestBody?: RequestBodyDefinition;
  responses: ResponseDefinition[];
  middleware?: string[];
  validation?: ValidationSchema;
}

export interface ParameterDefinition {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  type: DataType;
  required: boolean;
  description?: string;
  example?: any;
  validation?: ValidationSchema;
}

export interface RequestBodyDefinition {
  contentType: string;
  schema: SchemaDefinition;
  required: boolean;
  examples?: Record<string, any>;
}

export interface ResponseDefinition {
  statusCode: number;
  description: string;
  schema?: SchemaDefinition;
  headers?: Record<string, string>;
  examples?: Record<string, any>;
}

export interface SchemaDefinition {
  type: DataType;
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
  required?: string[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  enum?: any[];
}

export interface ValidationSchema {
  rules: ValidationRule[];
  errorMessages?: Record<string, string>;
}

export interface APIAuthentication {
  type: 'none' | 'api-key' | 'bearer' | 'oauth' | 'basic' | 'custom';
  config: Record<string, any>;
}

export interface APIDocumentation {
  format: 'openapi' | 'swagger' | 'postman' | 'insomnia';
  generateFrom: 'code' | 'definitions';
  outputPath: string;
}

export interface StateManagementDefinition {
  approach: 'centralized' | 'distributed' | 'hybrid';
  stores: StoreDefinition[];
  middleware?: MiddlewareDefinition[];
  persistence?: PersistenceConfig;
}

export interface StoreDefinition {
  name: string;
  initialState: Record<string, any>;
  actions: ActionDefinition[];
  reducers?: ReducerDefinition[];
  selectors?: SelectorDefinition[];
  effects?: EffectDefinition[];
}

export interface ActionDefinition {
  name: string;
  payload?: SchemaDefinition;
  async?: boolean;
  side_effects?: string[];
}

export interface ReducerDefinition {
  action: string;
  logic: string;
}

export interface SelectorDefinition {
  name: string;
  input: string[];
  logic: string;
  memoized?: boolean;
}

export interface EffectDefinition {
  trigger: string;
  logic: string;
  dependencies?: string[];
}

export interface MiddlewareDefinition {
  name: string;
  type: 'logger' | 'persist' | 'dev-tools' | 'custom';
  config: Record<string, any>;
}

export interface PersistenceConfig {
  storage: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'cookies';
  keys: string[];
  transform?: string;
}

export interface RoutingDefinition {
  type: 'client-side' | 'server-side' | 'hybrid';
  routes: RouteDefinition[];
  guards?: RouteGuard[];
  middleware?: RouteMiddleware[];
}

export interface RouteDefinition {
  path: string;
  component: string;
  name?: string;
  meta?: Record<string, any>;
  children?: RouteDefinition[];
  lazy?: boolean;
  guards?: string[];
}

export interface RouteGuard {
  name: string;
  type: 'before' | 'after' | 'resolve';
  logic: string;
}

export interface RouteMiddleware {
  name: string;
  logic: string;
  global?: boolean;
}

export interface TestingDefinition {
  strategies: TestingStrategy[];
  coverage: CoverageConfig;
  ci: CIConfig;
}

export interface TestingStrategy {
  type: 'unit' | 'integration' | 'e2e' | 'visual' | 'performance' | 'accessibility';
  framework: string;
  config: Record<string, any>;
  patterns: string[];
}

export interface CoverageConfig {
  threshold: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  exclude: string[];
  reports: string[];
}

export interface CIConfig {
  provider: 'github-actions' | 'gitlab-ci' | 'jenkins' | 'circleci' | 'travis';
  triggers: string[];
  steps: CIStep[];
}

export interface CIStep {
  name: string;
  command: string;
  condition?: string;
  artifacts?: string[];
}

export interface DeploymentDefinition {
  environments: EnvironmentDefinition[];
  pipeline: DeploymentPipeline;
  rollback: RollbackStrategy;
  monitoring: MonitoringConfig;
}

export interface EnvironmentDefinition {
  name: 'development' | 'staging' | 'production' | 'test';
  target: DeploymentTarget;
  config: Record<string, any>;
  secrets: string[];
  variables: Record<string, string>;
}

export interface DeploymentPipeline {
  stages: PipelineStage[];
  approval?: ApprovalConfig;
  notifications?: NotificationConfig;
}

export interface PipelineStage {
  name: string;
  environment: string;
  steps: string[];
  conditions?: string[];
  rollback?: boolean;
}

export interface ApprovalConfig {
  required: boolean;
  reviewers: string[];
  timeout?: number;
}

export interface NotificationConfig {
  channels: ('email' | 'slack' | 'webhook')[];
  events: ('success' | 'failure' | 'start' | 'approval')[];
  config: Record<string, any>;
}

export interface RollbackStrategy {
  automatic: boolean;
  conditions: string[];
  steps: string[];
}

export interface MonitoringConfig {
  metrics: MetricDefinition[];
  alerts: AlertDefinition[];
  dashboards: DashboardDefinition[];
}

export interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels?: string[];
}

export interface AlertDefinition {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  cooldown?: number;
}

export interface DashboardDefinition {
  name: string;
  metrics: string[];
  layout: string;
  filters?: string[];
}

// ===== 主要 ErIDL 介面 =====

export interface ErIDL {
  // 元數據
  metadata: {
    projectName: string;
    version: string;
    description: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    figmaFileId?: string;
    figmaUrl?: string;
    targetFrameworks: Framework[];
    designSystem?: string; // 設計系統參考
  };
  
  // 設計定義：UI/UX 相關的所有定義
  design: {
    screens: ScreenDefinition[];
    components: ComponentDefinition[];
    layouts: LayoutDefinition[];
    interactions: InteractionDefinition[];
    animations: AnimationDefinition[];
    designTokens: DesignTokenDefinition[];
    responsive: {
      breakpoints: Record<ScreenSize, number>;
      strategy: 'mobile-first' | 'desktop-first' | 'container-queries';
    };
  };
  
  // 業務定義：商業邏輯和業務流程
  business: {
    entities: EntityDefinition[];
    workflows: WorkflowDefinition[];
    userJourneys: UserJourneyDefinition[];
    businessRules: BusinessRuleDefinition[];
    permissions: {
      roles: string[];
      policies: PermissionRule[];
    };
  };
  
  // 技術定義：技術架構和實現細節
  technical: {
    architecture: ArchitectureDefinition;
    apis: APIDefinition[];
    stateManagement: StateManagementDefinition;
    routing: RoutingDefinition;
    testing: TestingDefinition;
    deployment: DeploymentDefinition;
    security: SecurityConfiguration;
    performance: {
      budgets: PerformanceBudget[];
      optimizations: string[];
    };
  };
  
  // 依賴關係：組件、頁面、功能之間的關係
  dependencies: {
    components: ComponentDependency[];
    screens: ScreenDependency[];
    apis: APIDependency[];
    external: ExternalDependency[];
  };
  
  // 配置：項目配置和環境設定
  configuration: {
    build: BuildConfiguration;
    development: DevelopmentConfiguration;
    production: ProductionConfiguration;
    feature_flags: FeatureFlag[];
  };
}

// ===== 依賴關係定義 =====

export interface ComponentDependency {
  component: string;
  dependencies: string[];
  type: 'import' | 'composition' | 'data' | 'event';
}

export interface ScreenDependency {
  screen: string;
  dependencies: string[];
  type: 'navigation' | 'data' | 'state';
}

export interface APIDependency {
  api: string;
  dependents: string[];
  type: 'data' | 'auth' | 'service';
}

export interface ExternalDependency {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer';
  optional?: boolean;
}

// ===== 配置定義 =====

export interface BuildConfiguration {
  outputDir: string;
  assetDir: string;
  publicPath: string;
  sourcemap: boolean;
  minify: boolean;
  target: string[];
  externals?: Record<string, string>;
}

export interface DevelopmentConfiguration {
  port: number;
  host: string;
  hot: boolean;
  open: boolean;
  proxy?: Record<string, string>;
  mock: boolean;
}

export interface ProductionConfiguration {
  optimize: boolean;
  gzip: boolean;
  analyze: boolean;
  cdn?: string;
  env: Record<string, string>;
}

export interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  environments?: string[];
  percentage?: number;
  conditions?: string[];
}

// ===== 性能預算 =====

export interface PerformanceBudget {
  metric: 'bundle-size' | 'first-contentful-paint' | 'largest-contentful-paint' | 'time-to-interactive';
  target: number;
  warning: number;
  error: number;
}

// ===== 導出主要類型 =====
export type {
  ScreenSize,
  InteractionType,
  AnimationType,
  DataType,
  HTTPMethod,
  DatabaseType,
  DeploymentTarget
};