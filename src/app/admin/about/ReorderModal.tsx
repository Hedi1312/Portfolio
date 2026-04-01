'use client';

import { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Modifier } from '@dnd-kit/core';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { SortableTechItem, type TechItem } from './SortableTechItem';

// Custom modifiers (inline to avoid @dnd-kit/modifiers Docker resolution issues)
const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

const restrictToParentElement: Modifier = ({ containerNodeRect, draggingNodeRect, transform }) => {
  if (!containerNodeRect || !draggingNodeRect) return transform;
  const minY = containerNodeRect.top - draggingNodeRect.top;
  const maxY =
    containerNodeRect.top +
    containerNodeRect.height -
    draggingNodeRect.top -
    draggingNodeRect.height;
  return { ...transform, x: 0, y: Math.min(Math.max(transform.y, minY), maxY) };
};

interface ReorderModalProps {
  isOpen: boolean;
  techs: TechItem[];
  isDark: boolean;
  onSave: (techs: TechItem[]) => void;
  onClose: () => void;
}

export default function ReorderModal({
  isOpen,
  techs,
  isDark,
  onSave,
  onClose,
}: ReorderModalProps) {
  const [localTechs, setLocalTechs] = useState<TechItem[]>([]);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(isOpen);
  useFocusTrap(modalRef, isOpen);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setLocalTechs([...techs]);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localTechs.findIndex((_, i) => `tech-${i}` === active.id);
    const newIndex = localTechs.findIndex((_, i) => `tech-${i}` === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      setLocalTechs(arrayMove(localTechs, oldIndex, newIndex));
    }
  };

  const moveTech = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localTechs.length) return;
    setLocalTechs(arrayMove(localTechs, index, newIndex));
  };

  const removeTech = (index: number) => {
    setLocalTechs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
          onClick={onClose}
        >
          <m.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Réorganiser les technologies
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {localTechs.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-8">Aucune technologie.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={localTechs.map((_, i) => `tech-${i}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {localTechs.map((tech, i) => (
                        <SortableTechItem
                          key={`tech-${i}`}
                          tech={tech}
                          index={i}
                          totalCount={localTechs.length}
                          isDark={isDark}
                          onMoveUp={() => moveTech(i, 'up')}
                          onMoveDown={() => moveTech(i, 'down')}
                          onRemove={() => setDeleteConfirmIndex(i)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 justify-end p-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <Button onClick={() => onSave(localTechs)}>Enregistrer l&apos;ordre</Button>
            </div>
          </m.div>
          {/* Internal Confirmation Modal */}
          <ConfirmModal
            isOpen={deleteConfirmIndex !== null}
            title="Supprimer la technologie"
            message={
              deleteConfirmIndex !== null && localTechs[deleteConfirmIndex]
                ? `La technologie "${localTechs[deleteConfirmIndex].name}" sera retirée de l'ordre.`
                : 'Cette technologie sera retirée.'
            }
            onConfirm={() => {
              if (deleteConfirmIndex !== null) {
                removeTech(deleteConfirmIndex);
                setDeleteConfirmIndex(null);
              }
            }}
            onCancel={() => setDeleteConfirmIndex(null)}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}
