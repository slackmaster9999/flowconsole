import '@mantine/core/styles.css';
import '@xyflow/react/dist/style.css';
import { CodeDiagramWorkbench, useTheme } from '@flowconsole/web';


export default function App() { 
  const { resolvedScheme, scheme, toggleScheme } = useTheme();
  return (
    <CodeDiagramWorkbench 
      themeControls={{ resolvedScheme, scheme, toggleScheme }}
    />
  );
}
