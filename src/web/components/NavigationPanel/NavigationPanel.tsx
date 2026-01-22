import { Popover } from '@mantine/core';
import { useReactFlow } from '@xyflow/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavigationPanelControls } from './NavigationPanelControls';
import { NavigationPanelDropdown } from './NavigationPanelDropdown';
import SearchOverlay from './SearchOverlay';
import type { ArchitectureNode, ArchitectureDiagramModel, FlowDefinition } from '../../diagram/types';
import { useHoverPopover, useNavigationHistory } from '../../hooks/hooks';
import type { ThemeControls } from '../../types/theme';
import './styles.css';

export type NavigationItem = {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  type: ArchitectureNode['type'];
  shape?: string;
  parentId?: string;
  children: NavigationItem[];
};

type Props = {
  model: ArchitectureDiagramModel;
  viewId?: string;
  viewTitle?: string;
  viewDescription?: string;
  flows?: FlowDefinition[];
  activeFlowId?: string;
  activeFlowStep?: number;
  nodeTitles?: Map<string, string>;
  onSelectFlow?: (id: string | undefined) => void;
  onFlowStepChange?: (step: number) => void;
  onNavigate?: (id: string) => void;
  onToggleFlowPanel?: () => void;
  themeControls?: ThemeControls;
};

function shouldIncludeInTree(node: ArchitectureNode) {
  return node.type === 'container' || node.type === 'element';
}

function buildSearchTree(model: ArchitectureDiagramModel) {
  const index = new Map<string, NavigationItem>();
  const roots: NavigationItem[] = [];

  model.nodes.forEach((node) => {
    const entry: NavigationItem = {
      id: node.id,
      title: node.data.title,
      description: 'description' in node.data ? node.data.description : undefined,
      badge: 'badge' in node.data ? node.data.badge : undefined,
      type: node.type,
      shape: 'shape' in node.data ? node.data.shape : undefined,
      parentId: node.parentId,
      children: [],
    };
    index.set(node.id, entry);
  });

  index.forEach((item) => {
    if (item.parentId && index.has(item.parentId)) {
      index.get(item.parentId)?.children.push(item);
    } else {
      roots.push(item);
    }
  });

  return { roots, index };
}

function buildNavigationTree(model: ArchitectureDiagramModel) {
  const index = new Map<string, NavigationItem>();
  const roots: NavigationItem[] = [];

  model.nodes.forEach((node) => {
    if (!shouldIncludeInTree(node)) return;
    const entry: NavigationItem = {
      id: node.id,
      title: node.data.title,
      description: node.data.description ?? node.data.subtitle,
      badge: node.data.badge,
      type: node.type,
      shape: 'shape' in node.data ? node.data.shape : undefined,
      parentId: node.parentId,
      children: [],
    };
    index.set(node.id, entry);
  });

  index.forEach((item) => {
    if (item.parentId && index.has(item.parentId)) {
      index.get(item.parentId)?.children.push(item);
    } else {
      roots.push(item);
    }
  });

  return { roots, index };
}

function collectFlat(items: NavigationItem[]) {
  const result: NavigationItem[] = [];
  const walk = (nodes: NavigationItem[]) => {
    nodes.forEach((n) => {
      result.push(n);
      if (n.children.length) walk(n.children);
    });
  };
  walk(items);
  return result;
}

function breadcrumbsFor(id: string | undefined, index: Map<string, NavigationItem>) {
  if (!id || !index.has(id)) return [];
  const chain: NavigationItem[] = [];
  let current: NavigationItem | undefined = index.get(id);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? index.get(current.parentId) : undefined;
  }
  return chain.map((c) => ({ id: c.id, title: c.title }));
}

export function NavigationPanel({
  model,
  viewId,
  viewTitle,
  viewDescription,
  onNavigate,
  onToggleFlowPanel,
  themeControls,
}: Props) {
  const { roots, index } = useMemo(() => buildNavigationTree(model), [model]);
  const flat = useMemo(() => collectFlat(roots), [roots]);
  const firstId = flat[0]?.id;
  const searchTrees = useMemo(() => buildSearchTree(model), [model]);
  const searchFlat = useMemo(() => collectFlat(searchTrees.roots), [searchTrees.roots]);

  const [activeId, setActiveId] = useState<string | undefined>(firstId);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(roots.map((r) => r.id))
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const flow = useReactFlow<ArchitectureNode>();
  const hoverPopover = useHoverPopover();
  const history = useNavigationHistory(firstId);

  const focusNode = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
      return;
    }
    const node = flow.getNode(id);
    if (!node) return;
    flow.fitView({ nodes: [{ id: node.id }], padding: 0.3, duration: 400 });
  };

  useEffect(() => {
    if (activeId && !index.has(activeId)) {
      const fallback = flat[0]?.id;
      setActiveId(fallback);
      if (fallback) history.visit(fallback);
    }
  }, [activeId, flat, history, index]);

  useEffect(() => {
    if (history.current && history.current !== activeId) {
      setActiveId(history.current);
      focusNode(history.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.current]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectItem = (id: string) => {
    setActiveId(id);
    history.visit(id);
    focusNode(id);
    setSearch('');
    hoverPopover.setOpened(false);
    setSearchOverlayOpen(false);
  };

  const breadcrumbs = useMemo(() => {
    const base = breadcrumbsFor(activeId, index);
    if (base.length === 0 && (viewTitle || viewId)) {
      return [{ id: viewId ?? 'view', title: viewTitle ?? viewId ?? 'Current view' }];
    }
    return base;
  }, [activeId, index, viewId, viewTitle]);

  const handleBack = () => {
    if (!history.canBack) return;
    history.goBack();
  };
  const handleForward = () => {
    if (!history.canForward) return;
    history.goForward();
  };

  return (
    <div className="navigation-panel">
      <Popover
        opened={hoverPopover.opened}
        onClose={hoverPopover.close}
        position="bottom-start"
        withArrow
        offset={4}
      >
        <Popover.Target>
          <div
            onClick={(e) => {
              e.stopPropagation();
              hoverPopover.toggleByClick();
            }}
          >
            <NavigationPanelControls
              breadcrumbs={breadcrumbs}
              viewTitle={viewTitle || viewDescription || viewId}
              onToggle={() => hoverPopover.toggleByClick()}
              onBack={handleBack}
              onForward={handleForward}
              canBack={history.canBack}
              canForward={history.canForward}
              activeId={activeId}
              onOpenSearch={() => {
                setSearchOverlayOpen(true);
              }}
              onOpenFlows={() => onToggleFlowPanel?.()}
              onTitleHoverStart={hoverPopover.openByHover}
              onTitleHoverEnd={hoverPopover.closeByHover}
              themeControls={themeControls}
            />
          </div>
        </Popover.Target>

        <Popover.Dropdown
          className="navpanel-shell"
          onMouseEnter={hoverPopover.openByHover}
          onMouseLeave={hoverPopover.closeByHover}
        >
          <NavigationPanelDropdown
            tree={roots}
            flat={flat}
            activeId={activeId}
            search={search}
            onSearch={setSearch}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            onSelect={selectItem}
            searchInputRef={searchInputRef}
          />
        </Popover.Dropdown>
      </Popover>
      <SearchOverlay
        opened={isSearchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
        tree={searchTrees.roots}
        items={searchFlat}
        activeId={activeId}
        onSelect={selectItem}
      />
    </div>
  );
}

export default NavigationPanel;
