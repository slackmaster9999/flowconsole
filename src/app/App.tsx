import '@mantine/core/styles.css';
import '@xyflow/react/dist/style.css';
import { CodeDiagramWorkbench } from 'flowconsole/components/Workbench/CodeDiagramWorkbench';
import { useTheme } from 'flowconsole/theme/ThemeProvider';


export default function App() { 
  const { resolvedScheme, scheme, toggleScheme } = useTheme();
  return (
    <CodeDiagramWorkbench 
      themeControls={{ resolvedScheme, scheme, toggleScheme }}
    />
  );
}
