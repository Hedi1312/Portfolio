'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { FiPlus, FiX, FiTrash2, FiMenu } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { SKILL_ICONS } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';
import type { TechItem } from './SortableTechItem';

// Lazy-load the ReorderModal
const ReorderModal = dynamic(() => import('./ReorderModal'), { ssr: false });

interface StatItem {
  value: string;
  label: string;
}

export interface InitialAboutData {
  bio: string;
  stats: StatItem[];
  techs: TechItem[];
}

export default function AboutForm({ initialData }: { initialData: InitialAboutData }) {
  const [bio, setBio] = useState(initialData.bio || '');
  const [stats, setStats] = useState<StatItem[]>(
    Array.isArray(initialData.stats) ? initialData.stats : [],
  );
  const [techs, setTechs] = useState<TechItem[]>(
    (initialData.techs || []).map((t: TechItem) => ({
      name: t.name,
      icon: t.icon,
      color: t.color,
    })),
  );
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
      const { updateAboutAction } = await import('@/actions/about.action');
      const res = await updateAboutAction({ bio, stats, techs });

      if (res.success) {
        showToast('success', 'Section « À propos » mise à jour !');
      } else {
        showToast('error', res.error || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      showToast('error', 'Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors';

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

      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl w-full"
      >
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
      </m.div>
    </>
  );
}
