import { Badge, Group, Input, Modal, ScrollArea, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconDatabase, IconLayoutGrid, IconSearch, IconServer, IconSquareRounded, IconUser } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import type { NavigationItem } from './NavigationPanel';

type Props = {
  opened: boolean;
  onClose: () => void;
  items: NavigationItem[];
  tree: NavigationItem[];
  activeId?: string;
  onSelect: (id: string) => void;
};

const iconByShape: Record<string, JSX.Element> = {
  person: <IconUser size={16} />,
  service: <IconServer size={16} />,
  database: <IconDatabase size={16} />,
  container: <IconLayoutGrid size={16} />,
};

function highlight(text: string, query: string) {
  if (!query) return text;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${safe})`, 'ig');
  return text.split(re).map((part, idx) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={idx} style={{ background: 'rgba(251, 191, 36, 0.6)', color: 'inherit' }}>
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function filterTree(items: NavigationItem[], query: string) {
  if (!query) return items;
  const q = query.toLowerCase();
  const walk = (list: NavigationItem[]): NavigationItem[] => {
    return list
      .map((item) => {
        const matches =
          item.title.toLowerCase().includes(q) ||
          (item.description ?? '').toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          (item.badge ?? '').toLowerCase().includes(q);
        const children = walk(item.children);
        if (matches || children.length) {
          return { ...item, children };
        }
        return null;
      })
      .filter(Boolean) as NavigationItem[];
  };
  return walk(items);
}

export function SearchOverlay({ opened, onClose, items: _items, tree, activeId, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (opened) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [opened]);

  useEffect(() => {
    const next = new Set<string>();
    const walk = (nodes: NavigationItem[]) => {
      nodes.forEach((n) => {
        next.add(n.id);
        if (n.children.length) walk(n.children);
      });
    };
    walk(tree);
    setExpanded(next);
  }, [tree]);

  const filteredTree = useMemo(() => filterTree(tree, query.trim()), [tree, query]);
  const hasResults = useMemo(() => {
    const walk = (nodes: NavigationItem[]): number =>
      nodes.reduce((acc, n) => acc + 1 + walk(n.children), 0);
    return walk(filteredTree) > 0;
  }, [filteredTree]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      transitionProps={{ duration: 150 }}
      overlayProps={{ opacity: 0.7, blur: 6 }}
      title={
        <Group gap="xs">
          <IconSearch size={18} />
          <Text fw={700}>Search elements</Text>
        </Group>
      }
      styles={{
        header: { borderBottom: '1px solid var(--navpanel-border)' },
      }}
    >
      <Input
        ref={inputRef}
        leftSection={<IconSearch size={16} />}
        placeholder="Search by title, id, description..."
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        mb="md"
        data-autofocus
      />
      <ScrollArea h="calc(100vh - 160px)" scrollbars="y">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: '100%' }}>
          {filteredTree.map((item) => (
            <SearchItem
              key={item.id}
              item={item}
              level={0}
              activeId={activeId}
              expanded={expanded}
              onToggleExpand={(id) =>
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) {
                    next.delete(id);
                  } else {
                    next.add(id);
                  }
                  return next;
                })
              }
              onSelect={(id) => {
                onSelect(id);
                onClose();
              }}
              query={query.trim()}
            />
          ))}
          {!hasResults && (
            <Text c="dimmed" size="sm" px="xs" py="md">
              No elements found
            </Text>
          )}
        </div>
      </ScrollArea>
    </Modal>
  );
}

type ItemProps = {
  item: NavigationItem;
  level: number;
  activeId?: string;
  onSelect: (id: string) => void;
  query: string;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
};

function SearchItem({ item, level, activeId, onSelect, query, expanded, onToggleExpand }: ItemProps) {
  const icon = iconByShape[item.shape ?? item.type] ?? <IconSquareRounded size={16} />;
  const hasChildren = item.children.length > 0;
  const isExpanded = expanded.has(item.id);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        padding: '10px',
        borderRadius: 10,
        background:
          activeId === item.id
            ? 'rgba(59,130,246,0.14)'
            : hovered
              ? 'var(--navpanel-item-hover)'
              : 'rgba(255,255,255,0.02)',
        border: activeId === item.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.05)',
        marginLeft: level * 14,
        cursor: 'pointer',
      }}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
    >
      <Group align="flex-start" justify="space-between" gap="sm" wrap="nowrap">
        <Group gap={8} align="flex-start" wrap="nowrap">
          {hasChildren ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(item.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                cursor: 'pointer',
              }}
            >
              {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            </span>
          ) : (
            icon
          )}
          <div>
            <div style={{ fontWeight: 700 }}>{highlight(item.title, query)}</div>
            {item.description ? (
              <div style={{ fontSize: 12, opacity: 0.8 }}>{highlight(item.description, query)}</div>
            ) : null}
            <div style={{ fontSize: 11, opacity: 0.6 }}>ID: {highlight(item.id, query)}</div>
          </div>
        </Group>
        <Badge size="sm" variant="light">
          {item.badge ?? item.type}
        </Badge>
      </Group>
      {hasChildren && isExpanded && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {item.children.map((child) => (
            <SearchItem
              key={child.id}
              item={child}
              level={level + 1}
              activeId={activeId}
              onSelect={onSelect}
              query={query}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchOverlay;
