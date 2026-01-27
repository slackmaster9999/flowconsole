import type { LanguageDefinition } from '../types';
import { TypeScriptPlaygroundRuntime } from '../runtime';

const javaSamples = [
  {
    id: 'unit-test-java',
    title: 'Unit Test Sample (Java)',
    description: 'Sample from core parser tests.',
    code: `import flowconsole.sdk.*;
import java.util.List;

User user = new User(UserArgs.builder()
  .name("user")
  .description("Administrator user")
  .tags(List.of("admin", "user"))
  .badge("gold")
  .build());

ReactApp app = new ReactApp(ComponentArgs.builder()
  .name("app")
  .build());

RestApi api = new RestApi(ComponentArgs.builder()
  .name("api")
  .belongsTo(app)
  .icon("api-icon")
  .build());

user.sendsRequest(app, "Load App");
app.then(api);
`,
  },
] satisfies LanguageDefinition['samples'];

const runtime = new TypeScriptPlaygroundRuntime();

export const javaLanguage: LanguageDefinition = {
  id: 'java',
  label: 'Java',
  monacoLanguage: 'java',
  monacoSetup: () => import('monaco-editor/esm/vs/basic-languages/java/java.contribution'),
  samples: javaSamples,
  defaultSampleId: javaSamples[0]?.id,
  evaluate: (source: string) => runtime.ParseDiagrammingCode(source, 'java'),
};
