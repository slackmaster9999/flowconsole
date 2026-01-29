import '@xyflow/react/dist/style.css';
import { CodeDiagramWorkbench, useTheme } from '@flowconsole/web';
import styles from './App.module.css';

export default function App() {
  const { resolvedScheme, scheme, toggleScheme } = useTheme();

  return (
    <div className={styles.root}>
      <div className={styles.banner} role="status">
        Showing generated diagrams is temporarily unavailable while we migrate to a new
        version.
      </div>
      <div className={styles.workbench}>
        <CodeDiagramWorkbench
          themeControls={{ resolvedScheme, scheme, toggleScheme }}
        />
      </div>
    </div>
  );
}
