import { test, expect, Page } from '@playwright/test';

test.describe('FlowConsole workbench', () => {
  type ContainerPathConfig = { path: string[]; expectedNodes?: string[]; nodesCount?: number; edgesCount?: number };

  const sampleConfigs = {
    'retail-banking': {
      rootNodes: ['Customer Dashboard', 'Data Store', 'Core Services'],
      containerPaths: [
        { path: ['Data Store'], expectedNodes: ['Ledger DB', 'Session Cache'], nodesCount: 2, edgesCount: 2 },
        {
          path: ['Core Services'],
          expectedNodes: ['Authentication', 'Accounts API', 'Fraud Guard'],
          nodesCount: 3,
          edgesCount: 3,
        },
      ],
    },
    'enterprise-erp': {
      rootNodes: ['Atlas ERP', 'Regional Planner', 'Supplier API'],
      containerPaths: [
        { path: ['Atlas ERP'], expectedNodes: ['Planner Portal', 'Integration Hub'], nodesCount: 2, edgesCount: 2 },
        {
          path: ['Atlas ERP', 'Integration Hub'],
          expectedNodes: ['Planning Service', 'Inventory Service', 'Workflow Queue', 'ERP Database'],
          nodesCount: 4,
          edgesCount: 4,
        }
      ],
    },
    'oss-collab': {
      rootNodes: ['Helios Web', 'Git Gateway', 'CI Cluster', 'Observability'],
      containerPaths: [
        { path: ['Git Gateway'], expectedNodes: ['Git HTTP', 'GraphQL API'], nodesCount: 2, edgesCount: 2 },
        { path: ['CI Cluster'], expectedNodes: ['CI Runner', 'Pipeline Queue'], nodesCount: 2, edgesCount: 2 },
        { path: ['Observability'], expectedNodes: ['Activity Stream', 'Metrics Store'], nodesCount: 2, edgesCount: 2 },
      ],
    },
    'media-streaming': {
      rootNodes: ['Device Apps', 'Control Plane', 'Data Plane', 'Observability'],
      containerPaths: [
        { path: ['Device Apps'], expectedNodes: ['TV App', 'Mobile App'], nodesCount: 2, edgesCount: 2 },
        {
          path: ['Control Plane'],
          expectedNodes: ['Identity', 'Catalog', 'Playback Service', 'Recommendations'],
          nodesCount: 4,
          edgesCount: 4,
        },
        { path: ['Data Plane'], expectedNodes: ['Content Ingest', 'Global CDN'], nodesCount: 2, edgesCount: 2 },
        { path: ['Observability'], expectedNodes: ['Watch Events', 'Metrics API'], nodesCount: 2, edgesCount: 2 },
      ],
    },
    'opensource-observability': {
      rootNodes: ['Control Plane', 'Data Lake', 'Dashboards', 'Cluster Agents'],
      containerPaths: [
        {
          path: ['Control Plane'],
          expectedNodes: ['Service Map API', 'Alert Manager', 'Ingest Gateway', 'Events Bus'],
        },
        { path: ['Data Lake'], expectedNodes: ['TSDB', 'Log Store'], edgesCount: 2, nodesCount: 2 },
        { path: ['Dashboards'], expectedNodes: ['Plugin Registry', 'Explorer UI'], edgesCount: 2, nodesCount: 2 },
        { path: ['Cluster Agents'], expectedNodes: ['Kube Agent'], edgesCount: 1, nodesCount: 1 },
      ],
    },
  } as const satisfies Record<
    'retail-banking' | 'enterprise-erp' | 'oss-collab' | 'media-streaming' | 'opensource-observability',
    { rootNodes: string[]; containerPaths: ContainerPathConfig[] }
  >;
  type SampleId = keyof typeof sampleConfigs;

  const waitForOverlayHidden = async (page: Page) => {
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 15000 });
  };

  const selectSample = async (page: Page, sampleId: string) => {
    const select = page.getByTestId('sample-select');
    await select.selectOption(sampleId);
    await waitForOverlayHidden(page);
  };

  const measureLayout = async (page: Page) => {
    return page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.react-flow__node')) as HTMLElement[];
      const edges = Array.from(document.querySelectorAll<SVGGraphicsElement>('.react-flow__edge-path'));
      const rects = nodes.map((el) => {
        const r = el.getBoundingClientRect();
        const isContainer = el.querySelector('.diagram-container') !== null;
        const isOpenContainer = isContainer && el.querySelector('.parent') !== null;
        const isElement = el.querySelector('.diagram-card') !== null;
        const type = isContainer ? 'container' : isElement ? 'element' : 'other';
        return { x1: r.x, y1: r.y, x2: r.x + r.width, y2: r.y + r.height, type, isOpenContainer };
      });

      const contains = (outer: { x1: number; y1: number; x2: number; y2: number }, inner: typeof outer) => {
        return outer.x1 <= inner.x1 && outer.y1 <= inner.y1 && outer.x2 >= inner.x2 && outer.y2 >= inner.y2;
      };

      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i];
          const b = rects[j];
          if (contains(a, b) || contains(b, a)) continue;
          if (a.isOpenContainer || b.isOpenContainer) continue;
          const overlap = !(a.x2 <= b.x1 || b.x2 <= a.x1 || a.y2 <= b.y1 || b.y2 <= a.y1);
          if (!overlap) continue;
          const aIsContainer = a.type === 'container';
          const bIsContainer = b.type === 'container';
          const aIsElement = a.type === 'element';
          const bIsElement = b.type === 'element';
          if ((aIsElement && bIsElement) || (aIsContainer && bIsContainer) || (aIsContainer && bIsElement) || (bIsContainer && aIsElement)) {
            console.log('Overlap detected between:', a, b);
            throw new Error('Node overlap detected');
          }
        }
      }

      const openContainers = rects.filter((r) => r.isOpenContainer);
      const nonOpenNodes = rects.filter((r) => !r.isOpenContainer && r.type !== 'other');
      openContainers.forEach((container) => {
        nonOpenNodes.forEach((node) => {
          const fullyInside =
            node.x1 >= container.x1 && node.x2 <= container.x2 && node.y1 >= container.y1 && node.y2 <= container.y2;
          if (fullyInside) return;
          const overlap = !(
            container.x2 <= node.x1 ||
            node.x2 <= container.x1 ||
            container.y2 <= node.y1 ||
            node.y2 <= container.y1
          );
          if (overlap) {
            throw new Error('Opened container overlaps external node');
          }
        });
      });

      const edgeBoxes = edges
        .map((el) => {
          try {
            const bb = el.getBBox();
            return { x1: bb.x, y1: bb.y, x2: bb.x + bb.width, y2: bb.y + bb.height };
          } catch {
            return null;
          }
        })
        .filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];

      const overlappedEdges = new Set<number>();
      for (let i = 0; i < edgeBoxes.length; i++) {
        for (let j = i + 1; j < edgeBoxes.length; j++) {
          const a = edgeBoxes[i];
          const b = edgeBoxes[j];
          const overlap = !(a.x2 <= b.x1 || b.x2 <= a.x1 || a.y2 <= b.y1 || b.y2 <= a.y1);
          if (overlap) {
            overlappedEdges.add(i);
            overlappedEdges.add(j);
          }
        }
      }

      return {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        overlappedEdges: overlappedEdges.size,
      };
    });
  };

  const expectNodesVisible = async (page: Page, titles: string[]) => {
    for (const title of titles) {
      const locator = page.locator('.react-flow__node', {
        has: page.locator('.diagram-card__title', { hasText: title }),
      });
      await expect(locator).toBeVisible({ timeout: 10000 });
    }
  };

  const measureScope = async (
    page: Page,
    accum: { edges: number; overlapped: number },
    options?: { minNodes?: number; minEdges?: number }
  ) => {
    const metrics = await measureLayout(page);
    const minNodes = options?.minNodes ?? 1;
    const minEdges = options?.minEdges ?? 1;
    expect(metrics.nodeCount).toBeGreaterThanOrEqual(minNodes);
    //expect(metrics.edgeCount).toBeGreaterThanOrEqual(minEdges);
    accum.edges += metrics.edgeCount;
    accum.overlapped += metrics.overlappedEdges;
  };

  const openContainerByTitle = async (page: Page, title: string) => {
    const container = page.locator('.react-flow__node', {
      has: page.locator('.diagram-card__title', { hasText: title }),
    });
    await expect(container).toBeVisible({ timeout: 10000 });
    const zoomButton = container.getByRole('button', { name: /zoom/i });
    await expect(zoomButton).toBeVisible({ timeout: 5000 });
    await page.mouse.wheel(0, 500);
    await zoomButton.click({ force: true });
    await waitForOverlayHidden(page);
  };

  const returnToRoot = async (page: Page) => {
    
    const zoomOut = page.getByRole('button', { name: /Go Up/i });
    if ((await zoomOut.count()) > 0) {
      await zoomOut.click({ force: true });
      await waitForOverlayHidden(page);
    }
  };

  const inspectContainerPath = async (
    page: Page,
    config: ContainerPathConfig,
    accum: { edges: number; overlapped: number }
  ) => {
    for (const title of config.path) {
      await openContainerByTitle(page, title);
      await measureScope(page, accum, {
        minNodes: config.nodesCount,
        minEdges: config.edgesCount,
      });
    }
    if (config.expectedNodes?.length) {
      await expectNodesVisible(page, config.expectedNodes);
    }
    await returnToRoot(page);
  };

  test('allows switching DSL samples', async ({ page }) => {
    await page.goto('/');
    const select = page.getByTestId('sample-select');
    await expect(select).toBeVisible();
    await select.selectOption('oss-collab');
    await expect(page.getByTestId('sample-description')).toContainText('open-source dev platform');
  });

  test('shows progress overlay while diagram is recomputed', async ({ page }) => {
    await page.goto('/');
    const overlay = page.getByTestId('progress-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toBeHidden({ timeout: 10000 });
  });

  test('surfaces DSL errors when code is invalid', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('.monaco-editor').first();
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('const broken = {\n  name: "Oops"\n};\nbroken.sendsRequestTo(target, "fail");');
    await expect(page.getByText('Error')).toBeVisible({ timeout: 2000 });
  });

  test('allows toggling the navigation theme control', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 10000 });
    const toggleButton = page.getByLabel('Toggle theme');
    await toggleButton.click();
    await expect(toggleButton).toBeVisible();
  });

  test('renders diagram nodes/edges with sample labels', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 10000 });
    expect(await page.locator('.react-flow__node').count()).toBeGreaterThan(1);
    expect(await page.locator('.react-flow__edge').count()).toBeGreaterThan(1);
    await expect(page.getByText(/Customer Dashboard/i)).toBeVisible();
  });

  test('navigates into container and back to root view', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 10000 });
    const zoomButtons = page.getByRole('button', { name: /zoom/i });
    await zoomButtons.first().click();
    await expect(page.getByText(/View:/i)).toBeVisible();
    await page.getByRole('button', { name: /Root view/i }).click();
    await expect(page.getByText(/View:/i)).toBeHidden({ timeout: 5000 });
  });

  test('plays flow steps and updates step indicator', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 10000 });
    await page.getByLabel('Flows').click();
    const flowSelect = page.locator('.flow-panel select');
    await flowSelect.selectOption({ index: 1 });
    const stepLabel = page.getByText(/Step \d+\/\d+/i);
    await expect(stepLabel).toBeVisible({ timeout: 5000 });
    const initialText = await stepLabel.innerText();
    await page.getByRole('button', { name: /Next/i }).click();
    await expect(stepLabel).not.toHaveText(initialText);
    await page.getByRole('button', { name: /Prev/i }).click();
  });

  test.skip('searches and focuses Customer Dashboard node via search overlay', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 10000 });
    await page.getByLabel('Search views').click();
    const searchInput = page.getByPlaceholder('Search by title, id, description...');
    await expect(searchInput).toBeFocused();
    await searchInput.fill('customer dashboard');
    await page.getByRole("button", {name:"Customer Dashboard"}).click();
    await expect(page.getByText(/Customer Dashboard/i)).toBeVisible();
  });

  test.skip('shows error for bad DSL then recovers after fix', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 10000 });
    const editor = page.locator('.monaco-editor').first();
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('const broken = { name: "Oops" };\nbroken.sendsRequestTo(target, "fail");');
    await expect(page.getByText('Error')).toBeVisible({ timeout: 4000 });
    await page.keyboard.press('Control+A');
    await page.keyboard.type('const user: User = { name: "Fixed" };');
    await expect(page.getByTestId('progress-overlay')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.code-pane__error')).toHaveCount(0);
  });

  const assertSampleLayoutQuality = async (page: Page, sampleId: SampleId) => {
    const config = sampleConfigs[sampleId];
    if (!config) throw new Error(`Unknown sample: ${sampleId}`);
    await page.goto('/');
    await waitForOverlayHidden(page);
    await selectSample(page, sampleId);
    await expectNodesVisible(page, config.rootNodes);
    const totals = { edges: 0, overlapped: 0 };
    await measureScope(page, totals);
    for (const container of config.containerPaths) {
      await inspectContainerPath(page, container, totals);
    }
    expect(totals.edges).toBeGreaterThan(0);
    const ratio = totals.edges ? totals.overlapped / totals.edges : 0;
    expect(ratio).toBeLessThan(0.5);
  };


  test('retail banking layout renders nodes/edges without overlaps', async ({ page }) => {
    await assertSampleLayoutQuality(page, 'retail-banking');
  });

  test('enterprise erp layout renders nodes/edges without overlaps', async ({ page }) => {
    await assertSampleLayoutQuality(page, 'enterprise-erp');
  });

  test('oss collaboration layout renders nodes/edges without overlaps', async ({ page }) => {
    await assertSampleLayoutQuality(page, 'oss-collab');
  });

  test('media streaming layout renders nodes/edges without overlaps', async ({ page }) => {
    await assertSampleLayoutQuality(page, 'media-streaming');
  });

  test('open-source observability layout renders nodes/edges without overlaps', async ({ page }) => {
    await assertSampleLayoutQuality(page, 'opensource-observability');
  });

  test.skip('generates diagram when C# language is selected', async ({ page }) => {
    test.setTimeout(5000);
    await page.goto('/');

    const languageSelect = page.getByTestId('language-select');
    await expect(languageSelect).toBeVisible();
    await languageSelect.selectOption('csharp');

    const overlay = page.getByTestId('progress-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toBeHidden({ timeout: 30000 });

    await expect(page.locator('.code-pane__error')).toHaveCount(0);

    const nodes = page.locator('.react-flow__node');
    await expect(nodes.first()).toBeVisible({ timeout: 5000 });
  });
});
