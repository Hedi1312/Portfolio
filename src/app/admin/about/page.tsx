'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiX, FiTrash2, FiArrowUp, FiArrowDown, FiMenu } from 'react-icons/fi';
import { UserCircle, GripVertical } from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Modifier } from '@dnd-kit/core';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { SKILL_ICONS } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useFocusTrap } from '@/hooks/useFocusTrap';

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

interface StatItem {
  value: string;
  label: string;
}

interface TechItem {
  name: string;
  icon: string | null;
  color: string;
}

// ─── Sortable Tech Item Component ──────────────────
function SortableTechItem({
  tech,
  index,
  totalCount,
  isDark,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  tech: TechItem;
  index: number;
  totalCount: number;
  isDark: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
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

// ─── Reorder Modal ─────────────────────────────────
function ReorderModal({
  isOpen,
  techs,
  isDark,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  techs: TechItem[];
  isDark: boolean;
  onSave: (techs: TechItem[]) => void;
  onClose: () => void;
}) {
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={onClose}
        >
          <motion.div
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
          </motion.div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AdminAboutPage() {
  const [bio, setBio] = useState('');
  const [stats, setStats] = useState<StatItem[]>([]);
  const [techs, setTechs] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const isDark = useIsDark();

  // ─── Modals ──────────────────────────────────────
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [deleteStatIndex, setDeleteStatIndex] = useState<number | null>(null);
  const [deleteTechIndex, setDeleteTechIndex] = useState<number | null>(null);

  // ─── Skill autocomplete ──────────────────────────
  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // ─── Fetch data ──────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/about');
      const data = await res.json();
      setBio(data.bio || '');
      setStats(Array.isArray(data.stats) ? data.stats : []);
      setTechs(
        (data.techs || []).map((t: TechItem & { id?: string }) => ({
          name: t.name,
          icon: t.icon,
          color: t.color,
        })),
      );
    } catch {
      showToast('error', 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Skill autocomplete logic ────────────────────
  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    const search = value.toLowerCase().trim();
    if (search.length > 0) {
      const matchingKeys = Object.entries(SKILL_ICONS)
        .filter(([k, v]) => k.includes(search) || v.label.toLowerCase().includes(search))
        .map(([k]) => k);
      const uniqueLabels = new Set<string>();
      const deduplicatedKeys = matchingKeys.filter((k) => {
        const label = SKILL_ICONS[k].label;
        if (uniqueLabels.has(label)) return false;
        uniqueLabels.add(label);
        return true;
      });
      setSuggestions(deduplicatedKeys.slice(0, 6));
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  const addTech = (name: string) => {
    const search = name.toLowerCase().trim();
    const matchData = Object.entries(SKILL_ICONS).find(
      ([k, v]) => k === search || v.label.toLowerCase() === search,
    );

    const canonicalName = matchData ? matchData[1].label : name;
    const canonicalKey = matchData ? matchData[0] : null;

    const isDuplicate = techs.some(
      (t) =>
        t.name.toLowerCase() === canonicalName.toLowerCase() ||
        (t.icon && canonicalKey && t.icon === canonicalKey),
    );

    if (isDuplicate) {
      showToast('error', `"${canonicalName}" empêché : déjà ajouté.`);
      return;
    }

    const tech: TechItem = {
      name: canonicalName,
      icon: canonicalKey,
      color: matchData ? matchData[1].color : '#00D5BE',
    };
    setTechs((prev) => [...prev, tech]);
    showToast('success', `"${canonicalName}" ajouté.`);
    setSkillInput('');
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // ─── Stats management ───────────────────────────
  const addStat = () => {
    setStats((prev) => [...prev, { value: '', label: '' }]);
    showToast('success', 'Nouvelle statistique ajoutée.');
  };

  const updateStat = (index: number, field: 'value' | 'label', val: string) => {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  };

  // ─── Save ────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, stats, techs }),
      });

      if (res.ok) {
        showToast('success', 'Section « À propos » mise à jour !');
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      showToast('error', 'Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors';

  if (loading) {
    return (
      <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
        <div className="mx-auto max-w-4xl w-full text-center text-neutral-400 py-20">
          Chargement...
        </div>
      </section>
    );
  }

  return (
    <>
      <ToastContainer toast={toast} onClose={hideToast} />

      {/* ─── Delete Stat Confirmation ──────────────── */}
      <ConfirmModal
        isOpen={deleteStatIndex !== null}
        title="Supprimer la statistique"
        message={
          deleteStatIndex !== null && stats[deleteStatIndex]
            ? `La statistique "${stats[deleteStatIndex].value} — ${stats[deleteStatIndex].label || 'sans label'}" sera supprimée.`
            : 'Cette statistique sera supprimée.'
        }
        onConfirm={() => {
          if (deleteStatIndex !== null) {
            const stat = stats[deleteStatIndex];
            const name = stat.label || 'sans label';
            setStats((prev) => prev.filter((_, i) => i !== deleteStatIndex));
            setDeleteStatIndex(null);
            showToast('success', `Statistique "${name}" supprimée.`);
          }
        }}
        onCancel={() => setDeleteStatIndex(null)}
      />

      {/* ─── Delete Tech Confirmation ─────────────── */}
      <ConfirmModal
        isOpen={deleteTechIndex !== null}
        title="Supprimer la technologie"
        message={
          deleteTechIndex !== null && techs[deleteTechIndex]
            ? `La technologie "${techs[deleteTechIndex].name}" sera retirée de la liste.`
            : 'Cette technologie sera retirée.'
        }
        onConfirm={() => {
          if (deleteTechIndex !== null) {
            const removedName = techs[deleteTechIndex].name;
            setTechs((prev) => prev.filter((_, i) => i !== deleteTechIndex));
            setDeleteTechIndex(null);
            showToast('success', `Technologie "${removedName}" supprimée.`);
          }
        }}
        onCancel={() => setDeleteTechIndex(null)}
      />

      {/* ─── Reorder Modal ────────────────────────── */}
      <ReorderModal
        isOpen={showReorderModal}
        techs={techs}
        isDark={isDark}
        onSave={(reordered) => {
          setTechs(reordered);
          setShowReorderModal(false);
          showToast('success', 'Ordre mis à jour ! Pensez à enregistrer.');
        }}
        onClose={() => setShowReorderModal(false)}
      />

      <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl w-full"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                aria-label="Retour au tableau de bord"
              >
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                  <UserCircle className="text-brand-500" />
                  Section À propos
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Modifiez le contenu de votre section de présentation
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* ─── Bio ──────────────────────────────── */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                Présentation
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Séparez les paragraphes par une ligne vide.
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`${inputClasses} resize-none`}
                rows={6}
                placeholder="Écrivez votre présentation..."
                disabled={saving}
              />
            </div>

            {/* ─── Stats ────────────────────────────── */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Statistiques</h2>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addStat}
                  disabled={saving}
                  className="py-2 px-3 h-auto text-sm"
                >
                  <FiPlus size={16} />
                  Ajouter
                </Button>
              </div>

              {stats.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">
                  Aucune statistique ajoutée.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(i, 'value', e.target.value)}
                        placeholder="Valeur"
                        className="rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors w-24 shrink-0"
                        disabled={saving}
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(i, 'label', e.target.value)}
                        placeholder="Label (ex: Projets réalisés)"
                        className="flex-1 min-w-0 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => setDeleteStatIndex(i)}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-danger-500 transition-colors cursor-pointer shrink-0"
                        title="Supprimer"
                        disabled={saving}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Technologies ──────────────────────── */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Technologies</h2>
                {techs.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowReorderModal(true)}
                    disabled={saving}
                    className="py-2 px-3 h-auto text-sm"
                  >
                    <FiMenu size={16} />
                    Modifier l&apos;ordre
                  </Button>
                )}
              </div>

              {/* Autocomplete input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => handleSkillInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectedIndex((prev) => Math.max(prev - 1, 0));
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                        addTech(suggestions[selectedIndex]);
                      } else if (skillInput.trim()) {
                        addTech(skillInput.trim());
                      }
                    } else if (e.key === 'Escape') {
                      setSuggestions([]);
                      setSelectedIndex(-1);
                    }
                  }}
                  className={inputClasses}
                  placeholder="Ajouter une technologie (React, Docker...)"
                  disabled={saving}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {suggestions.map((s, idx) => {
                      const entry = SKILL_ICONS[s];
                      const Icon = entry?.icon;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addTech(s)}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors cursor-pointer ${
                            selectedIndex === idx
                              ? 'bg-neutral-100 dark:bg-neutral-700'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {Icon && (
                            <Icon
                              size={18}
                              style={{
                                color: isDark ? entry.color : entry.colorLight || entry.color,
                              }}
                            />
                          )}
                          <span className="text-sm font-medium">{entry?.label || s}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  Appuie sur Entrée pour ajouter. Les icônes sont détectées automatiquement.
                </p>
              </div>

              {/* Techs display */}
              {techs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech, i) => {
                    const match = tech.icon
                      ? SKILL_ICONS[tech.icon]
                      : SKILL_ICONS[tech.name.toLowerCase()];
                    const Icon = match?.icon;
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-medium"
                      >
                        {Icon && (
                          <Icon
                            size={14}
                            style={{
                              color: isDark ? match.color : match.colorLight || match.color,
                            }}
                          />
                        )}
                        {tech.name}
                        <button
                          type="button"
                          onClick={() => setDeleteTechIndex(i)}
                          className="ml-1 p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer transition-colors"
                          title="Supprimer"
                          disabled={saving}
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-4">
                  Aucune technologie ajoutée.
                </p>
              )}
            </div>

            {/* ─── Save button ──────────────────────── */}
            <div className="flex justify-end">
              <Button onClick={handleSave} isLoading={saving} loadingText="Enregistrement...">
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
