import { useMemo, type JSX, type RefObject } from 'react';
import { ActionIcon, Badge, Group, ScrollArea, TextInput, Tooltip } from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconDatabase,
  IconLayoutGrid,
  IconServer,
  IconSquareRounded,
  IconUser,
} from '@tabler/icons-react';
import type { NavigationItem } from './NavigationPanel';

type Props = {
  tree: NavigationItem[];
  flat: NavigationItem[];
  activeId?: string;
  search: string;
  onSearch: (value: string) => void;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
};

const iconByShape: Record<string, JSX.Element> = {
  person: <IconUser size={14} />,
  service: <IconServer size={14} />,
  database: <IconDatabase size={14} />,
  container: <IconLayoutGrid size={14} />,
};

export function NavigationPanelDropdown({
  tree,
  flat,
  activeId,
  search,
  onSearch,
  expanded,
  onToggleExpand,
  onSelect,
  searchInputRef,
}: Props) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return flat.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q) ||
        (item.badge ?? '').toLowerCase().includes(q)
    );
  }, [flat, search]);

  const listToRender = filtered ?? tree;

  return (
    <div className="navpanel-dropdown" role="dialog">
      <div className="navpanel-dropdown__inner">
        <TextInput
          placeholder="Search views..."
          value={search}
          onChange={(e) => onSearch(e.currentTarget.value)}
          size="sm"
          ref={searchInputRef}
        />

        <ScrollArea
          className="navpanel-dropdown__scroll"
          scrollbars="y"
          type="auto"
          styles={{
            viewport: {
              maxHeight: 428,
            },
          }}
          style={{ maxHeight: 428, marginTop: 8 }}
        >
          <div className="navpanel-tree">
            {Array.isArray(listToRender)
              ? listToRender.map((item) => (
                  <NavigationItemRow
                    key={item.id}
                    item={item}
                    level={0}
                    activeId={activeId}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                    onSelect={onSelect}
                    isFlat={!!filtered}
                  />
                ))
              : null}
            {listToRender && listToRender.length === 0 ? (
              <div className="navpanel-empty">Empty</div>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

type RowProps = {
  item: NavigationItem;
  level: number;
  activeId?: string;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  isFlat: boolean;
};

function NavigationItemRow({
  item,
  level,
  activeId,
  expanded,
  onToggleExpand,
  onSelect,
  isFlat,
}: RowProps) {
  const hasChildren = item.children.length > 0;
  const isExpanded = expanded.has(item.id);
  const icon = iconByShape[item.shape ?? item.type] ?? <IconSquareRounded size={14} />;

  return (
    <div
      className={`navpanel-item ${activeId === item.id ? 'is-active' : ''}`}
      style={{ paddingLeft: 12 + level * 14 }}
      onClick={() => onSelect(item.id)}
    >
      <Group gap={8} align="flex-start" wrap="nowrap" style={{ width: '100%' }}>
        <div className="navpanel-item__left">
          {hasChildren && !isFlat ? (
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(item.id);
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </ActionIcon>
          ) : (
            <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>{icon}</div>
          )}
        </div>
        <div
          className="navpanel-item__content"
          role="button"
          aria-pressed={activeId === item.id}
        >
          <Group gap={6} wrap="nowrap" align="center">
            <div className="navpanel-item__icon">{icon}</div>
            <div>
              <div className="navpanel-item__title">{item.title}</div>
              {item.description ? <div className="navpanel-item__desc">{item.description}</div> : null}
            </div>
          </Group>
        </div>
        <Tooltip label={item.badge ?? item.type} openDelay={300}>
          <Badge size="sm" variant="light">
            {item.badge ?? item.type}
          </Badge>
        </Tooltip>
      </Group>

      {hasChildren && isExpanded && !isFlat ? (
        <div className="navpanel-children">
          {item.children.map((child) => (
            <NavigationItemRow
              key={child.id}
              item={child}
              level={level + 1}
              activeId={activeId}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              isFlat={isFlat}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default NavigationPanelDropdown;
