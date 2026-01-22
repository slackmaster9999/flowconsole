import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconChevronRight, IconGitBranch, IconMoonStars, IconSearch, IconSunHigh } from '@tabler/icons-react';
import { isMacOs } from '@xyflow/system';
import type { ThemeControls } from '../../types/theme';
import { FlowConsoleLogo } from '../FlowConsoleLogo';

type Crumb = { id: string; title: string };

type Props = {
  breadcrumbs: Crumb[];
  viewTitle?: string;
  onToggle: () => void;
  onBack: () => void;
  onForward: () => void;
  canBack: boolean;
  canForward: boolean;
  onOpenSearch?: () => void;
  onOpenFlows?: () => void;
  activeId?: string;
  onTitleHoverStart?: () => void;
  onTitleHoverEnd?: () => void;
  themeControls?: ThemeControls;
};

export function NavigationPanelControls({
  breadcrumbs,
  viewTitle,
  onToggle,
  onBack,
  onForward,
  canBack,
  canForward,
  onOpenSearch,
  onOpenFlows,
  activeId,
  onTitleHoverStart,
  onTitleHoverEnd,
  themeControls,
}: Props) {
  const isDark = themeControls?.resolvedScheme === 'dark';
  const themeLabel =
    themeControls?.scheme === 'auto'
      ? `Theme: System (${themeControls.resolvedScheme})`
      : themeControls
        ? `Theme: ${themeControls.scheme}`
        : 'Theme';
  const isMac = isMacOs();

  return (
    <div className="navpanel-controls" onClick={onToggle}>
      <Group gap={8} style={{ flexWrap: 'nowrap' }}>
        <FlowConsoleLogo color="#7c3aed" />
        <div
          className="navpanel-meta"
          onMouseEnter={onTitleHoverStart}
          onMouseLeave={onTitleHoverEnd}
        >
          <div className="navpanel-breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.id} className="navpanel-crumb">
                {crumb.title}
                {idx < breadcrumbs.length - 1 ? (
                  <IconChevronRight size={14} stroke={2} style={{ opacity: 0.6, margin: '0 4px' }} />
                ) : null}
              </span>
            ))}
          </div>
          {viewTitle ? (
            <Text size="sm" style={{ fontWeight: 700, color: 'var(--navpanel-text-strong)' }}>
              {viewTitle}
            </Text>
          ) : null}
        </div>
        <Group gap={6} className="navpanel-actions">
          {activeId ? (
            <Text size="sm" style={{ fontWeight: 700, color: 'var(--navpanel-text-strong)' }}>
              {activeId}
            </Text>
          ) : null}
          <Tooltip label="Back" openDelay={300}>
            <ActionIcon
              variant="light"
              disabled={!canBack}
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              aria-label="Back"
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Forward" openDelay={300}>
            <ActionIcon
              variant="light"
              disabled={!canForward}
              onClick={(e) => {
                e.stopPropagation();
                onForward();
              }}
              aria-label="Forward"
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Search views" openDelay={300}>
            <ActionIcon
              variant="filled"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSearch?.();
              }}
              aria-label="Search views"
            >
              <IconSearch size={16} />
              {isMac ? '' : ''}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Flows" openDelay={300}>
            <ActionIcon
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFlows?.();
              }}
              aria-label="Flows"
            >
              <IconGitBranch size={16} />
            </ActionIcon>
          </Tooltip>
             
          {themeControls ? (
            <Tooltip label={`${themeLabel}. Click to cycle`} openDelay={300}>
              <ActionIcon
                variant="light"
                onClick={(e) => {
                  e.stopPropagation();
                  themeControls.toggleScheme();
                }}
                aria-label="Toggle theme"
              >
                {isDark ? <IconSunHigh size={16} /> : <IconMoonStars size={16} />}
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Group>
      </Group>
    </div>
  );
}

export default NavigationPanelControls;
