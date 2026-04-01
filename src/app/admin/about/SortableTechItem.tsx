'use client';

import { GripVertical } from 'lucide-react';
import { FiArrowUp, FiArrowDown, FiTrash2 } from 'react-icons/fi';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SKILL_ICONS } from '@/lib/skill-icons';

export interface TechItem {
  name: string;
  icon: string | null;
  color: string;
}

interface SortableTechItemProps {
  tech: TechItem;
  index: number;
  totalCount: number;
  isDark: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function SortableTechItem({
  tech,
  index,
  totalCount,
  isDark,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SortableTechItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `tech-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const match = tech.icon ? SKILL_ICONS[tech.icon] : SKILL_ICONS[tech.name.toLowerCase()];
  const Icon = match?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-neutral-400 hover:text-brand-500 cursor-grab active:cursor-grabbing p-1 shrink-0"
      >
        <GripVertical size={18} />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon && (
          <Icon
            size={18}
            style={{ color: isDark ? match.color : match.colorLight || match.color }}
          />
        )}
        <span className="text-sm font-medium truncate">{tech.name}</span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <FiArrowUp size={14} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <FiArrowDown size={14} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-danger-500 transition-colors cursor-pointer ml-1"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
}
