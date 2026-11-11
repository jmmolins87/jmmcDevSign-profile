"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

export type TabItem = {
  content: ReactNode;
  disabled?: boolean;
  id: string;
  label: string;
};

export type TabsProps = {
  ariaLabel: string;
  defaultTabId?: string;
  items: readonly TabItem[];
};

export function Tabs({ ariaLabel, defaultTabId, items }: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeTabId, setActiveTabId] = useState(defaultTabId ?? items[0]?.id ?? "");
  const activeItem = items.find((item) => item.id === activeTabId && !item.disabled) ?? items[0];

  if (!activeItem) return null;

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabledIndexes = items
      .map((item, itemIndex) => (item.disabled ? -1 : itemIndex))
      .filter((itemIndex) => itemIndex >= 0);
    const currentPosition = enabledIndexes.indexOf(index);
    if (currentPosition < 0) return;

    let nextPosition: number | undefined;
    if (event.key === "ArrowRight") nextPosition = (currentPosition + 1) % enabledIndexes.length;
    if (event.key === "ArrowLeft") nextPosition = (currentPosition - 1 + enabledIndexes.length) % enabledIndexes.length;
    if (event.key === "Home") nextPosition = 0;
    if (event.key === "End") nextPosition = enabledIndexes.length - 1;
    if (nextPosition === undefined) return;

    event.preventDefault();
    const nextIndex = enabledIndexes[nextPosition];
    tabRefs.current[nextIndex]?.focus();
    setActiveTabId(items[nextIndex].id);
  }

  return (
    <div>
      <div aria-label={ariaLabel} className="flex flex-wrap border-b border-border" role="tablist">{/* taste-skill-ignore: tablist rule from DESIGN.md */}
        {items.map((item, index) => {
          const isActive = item.id === activeItem.id;
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;
          return (
            <button
              aria-controls={panelId}
              aria-selected={isActive}
              className={cn(
                "min-h-11 border-b-2 px-space-md font-headline text-label-caps uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50", // taste-skill-ignore: tab indicator rule from DESIGN.md
                isActive ? "border-accent text-primary" : "border-transparent text-on-surface-variant hover:text-primary",
              )}
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => setActiveTabId(item.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        aria-labelledby={`${baseId}-tab-${activeItem.id}`}
        className="pt-space-lg"
        id={`${baseId}-panel-${activeItem.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeItem.content}
      </div>
    </div>
  );
}
