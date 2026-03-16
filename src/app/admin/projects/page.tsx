'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiGithub,
  FiExternalLink,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiEyeOff,
  FiMenu,
} from 'react-icons/fi';
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { SKILL_ICONS } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';
import { z } from 'zod';

// ─── Zod Schema ──────────────────────────────────────
const projectSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  gradient: z.string(),
  link: z.union([z.literal(''), z.string().url('URL invalide')]).optional(),
  github: z.union([z.literal(''), z.string().url('URL invalide')]).optional(),
  visible: z.boolean(),
  skills: z.array(z.any()),
});

// ─── Types ───────────────────────────────────────────
interface ProjectImage {
  id: string;
  url: string;
  public_id: string;
  order: number;
}

interface Skill {
  id?: string;
  name: string;
  icon?: string | null;
  color: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  gradient: string;
  link?: string | null;
  github?: string | null;
  order: number;
  visible: boolean;
  skills: Skill[];
  images: ProjectImage[];
  createdAt: string;
}

// ─── Sortable Item Component ──────────────────────────
function SortableProjectItem({
  project,
  idx,
  projectsLength,
  moveProject,
  toggleVisibility,
  openEdit,
  setDeleteTarget,
}: {
  project: Project;
  idx: number;
  projectsLength: number;
  moveProject: (id: string, direction: 'up' | 'down') => void;
  toggleVisibility: (p: Project) => void;
  openEdit: (p: Project) => void;
  setDeleteTarget: (p: Project) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 10, position: 'relative' as const } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${
        !project.visible ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-lg ring-2 ring-brand-500/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Drag Handle */}
        <div
          className="mt-1 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-brand-500 p-1"
          {...attributes}
          {...listeners}
        >
          <FiMenu size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold truncate">{project.title}</h3>
            {!project.visible && (
              <span className="text-xs bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-100 px-2 py-0.5 rounded-full font-medium shadow-sm">
                Masqué
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Skills tags */}
          {project.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-brand-400/10 text-brand-600 dark:text-brand-400 border border-brand-400/20"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-brand-400 transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <FiGithub size={12} /> GitHub
              </a>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-brand-400 transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <FiExternalLink size={12} /> Lien
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1 shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => moveProject(project.id, 'up')}
            disabled={idx === 0}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <FiArrowUp size={16} />
          </button>
          <button
            onClick={() => moveProject(project.id, 'down')}
            disabled={idx === projectsLength - 1}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <FiArrowDown size={16} />
          </button>
          <button
            onClick={() => toggleVisibility(project)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title={project.visible ? 'Masquer' : 'Afficher'}
          >
            {project.visible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
          </button>
          <button
            onClick={() => openEdit(project)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-brand-500 transition-colors cursor-pointer"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(project)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-danger-500 transition-colors cursor-pointer"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Image Sortable Component ──────────────────────────
function SortableImageItem({
  img,
  idx,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  img: ProjectImage;
  idx: number;
  total: number;
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 10, position: 'relative' as const } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-video rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 ${
        isDragging ? 'shadow-lg ring-2 ring-brand-500/50' : ''
      }`}
    >
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
        {...attributes}
        {...listeners}
      />
      <img
        src={img.url}
        alt="Project image"
        className="w-full h-full object-cover pointer-events-none"
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none">
        <div className="flex gap-2 relative z-10 pointer-events-auto">
          <button
            onClick={onMoveUp}
            disabled={idx === 0}
            className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded cursor-pointer disabled:opacity-50"
          >
            <FiArrowLeft size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={idx === total - 1}
            className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded cursor-pointer disabled:opacity-50"
          >
            <FiArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
        <button
          onClick={onDelete}
          className="px-2 py-1 bg-danger-500/80 hover:bg-danger-500 text-white rounded text-xs font-semibold cursor-pointer relative z-10 pointer-events-auto"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

// ─── Gradient presets ────────────────────────────────
const GRADIENTS = [
  { label: 'Brand', value: 'from-brand-400/20 to-brand-600/20' },
  { label: 'Violet', value: 'from-purple-400/20 to-pink-600/20' },
  { label: 'Bleu', value: 'from-blue-400/20 to-cyan-600/20' },
  { label: 'Orange', value: 'from-orange-400/20 to-red-600/20' },
  { label: 'Vert', value: 'from-green-400/20 to-emerald-600/20' },
  { label: 'Rose', value: 'from-pink-400/20 to-rose-600/20' },
  { label: 'Indigo', value: 'from-indigo-400/20 to-violet-600/20' },
];

// ─── Default form ────────────────────────────────────
const defaultForm = {
  title: '',
  description: '',
  gradient: GRADIENTS[0].value,
  link: '',
  github: '',
  visible: true,
  skills: [] as Skill[],
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const isDark = useIsDark();

  // ─── Fetch projects ──────────────────────────────
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      setProjects(data);
    } catch {
      showToast('error', 'Erreur lors du chargement des projets.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ─── Skill autocomplete ──────────────────────────
  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    const search = value.toLowerCase().trim();
    if (search.length > 0) {
      // Filtrer les clés qui matchent
      const matchingKeys = Object.keys(SKILL_ICONS).filter((k) => k.includes(search));

      // Dédoublonner par `label` pour ne pas avoir "next.js" et "nextjs"
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

  const addSkill = (name: string) => {
    const key = name.toLowerCase().trim();
    if (form.skills.some((s) => s.name.toLowerCase() === key)) return;

    const match = SKILL_ICONS[key];
    const skill: Skill = {
      name: match ? match.label : name, // Utiliser le label bien formaté si trouvé
      icon: match ? key : null,
      color: match?.color || '#00D5BE',
    };
    setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    setSkillInput('');
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const removeSkill = (index: number) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((_, i) => i !== index) }));
  };

  // ─── Open edit form ──────────────────────────────
  const openEdit = (project: Project) => {
    setFormErrors({});
    setEditingId(project.id);
    setExistingImages(project.images || []);
    setForm({
      title: project.title,
      description: project.description,
      gradient: project.gradient,
      link: project.link || '',
      github: project.github || '',
      visible: project.visible,
      skills: project.skills.map((s) => ({
        name: s.name,
        icon: s.icon,
        color: s.color,
      })),
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setFormErrors({});
    setEditingId(null);
    setExistingImages([]);
    setForm(defaultForm);
    setFormOpen(true);
  };

  // ─── Save ────────────────────────────────────────
  const handleSave = async () => {
    const result = projectSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(fieldErrors)) {
        if (messages && messages.length > 0) {
          errors[key] = messages[0];
        }
      }
      setFormErrors(errors);
      showToast('error', 'Veuillez corriger les erreurs du formulaire.');
      return;
    }

    setFormErrors({});
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/projects/${editingId}` : '/api/admin/projects';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        showToast(
          'success',
          editingId ? `Projet "${form.title}" modifié !` : `Projet "${form.title}" créé !`,
        );
        setFormOpen(false);
        setForm(defaultForm);
        setEditingId(null);
        fetchProjects();
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

  // ─── Delete ──────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/projects/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', `Projet "${deleteTarget.title}" supprimé.`);
        setDeleteTarget(null);
        fetchProjects();
      }
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    }
  };

  // ─── Reorder ─────────────────────────────────────
  const moveProject = async (id: string, direction: 'up' | 'down') => {
    const idx = projects.findIndex((p) => p.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === projects.length - 1))
      return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const a = projects[idx];
    const b = projects[swapIdx];

    // Swap orders
    await Promise.all([
      fetch(`/api/admin/projects/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...a, order: b.order, skills: a.skills }),
      }),
      fetch(`/api/admin/projects/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...b, order: a.order, skills: b.skills }),
      }),
    ]);

    fetchProjects();
  };

  // ─── Drag and Drop ───────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      const newProjects = arrayMove(projects, oldIndex, newIndex);
      // Optimistic upate
      setProjects(newProjects);

      // Save order to API in background
      const updates = newProjects.map((p, i) => {
        if (p.order !== i) {
          return fetch(`/api/admin/projects/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...p, order: i, skills: p.skills }),
          });
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(updates);
      } catch {
        showToast('error', "Erreur lors de la sauvegarde de l'ordre.");
        fetchProjects(); // revert on error
      }
    }
  };

  const handleImageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (!editingId) return;

      const oldIndex = existingImages.findIndex((img) => img.id === active.id);
      const newIndex = existingImages.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(existingImages, oldIndex, newIndex);
      setExistingImages(newImages);

      // Save order to API
      const updates = newImages.map((img, i) => {
        if (img.order !== i) {
          img.order = i;
          return fetch(`/api/admin/projects/${editingId}/images/${img.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: i }),
          });
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(updates);
        fetchProjects(); // update global state
      } catch {
        showToast('error', "Erreur lors de la sauvegarde de l'ordre des images.");
      }
    }
  };

  // ─── Toggle visibility ──────────────────────────
  const toggleVisibility = async (project: Project) => {
    await fetch(`/api/admin/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, visible: !project.visible, skills: project.skills }),
    });
    fetchProjects();
  };

  // ─── Image Management ─────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingId) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => formData.append('files', file));

    try {
      const res = await fetch(`/api/admin/projects/${editingId}/images`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExistingImages((prev) => [...prev, ...data.images]);
        showToast('success', 'Images ajoutées !');
        fetchProjects(); // Rafraîchir la liste globale
      } else {
        showToast('error', data.error || 'Erreur lors du telechargement.');
      }
    } catch {
      showToast('error', 'Erreur reseau lors du telechargement.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/admin/projects/${editingId}/images/${imageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        showToast('success', 'Image supprimée.');
        fetchProjects(); // Rafraîchir la liste globale
      } else {
        showToast('error', 'Erreur lors de la suppression.');
      }
    } catch {
      showToast('error', 'Erreur réseau.');
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    if (!editingId) return;
    const idx = existingImages.findIndex((img) => img.id === id);
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === existingImages.length - 1)
    )
      return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newImages = [...existingImages];
    const a = newImages[idx];
    const b = newImages[swapIdx];

    // Swap locally
    newImages[idx] = b;
    newImages[swapIdx] = a;
    setExistingImages(newImages);

    // Save order
    await Promise.all([
      fetch(`/api/admin/projects/${editingId}/images/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/projects/${editingId}/images/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);

    // We update local orders specifically to match DB expectations in future moves
    setExistingImages((prev) => {
      const updated = [...prev];
      const newA = updated.find((img) => img.id === a.id);
      const newB = updated.find((img) => img.id === b.id);
      if (newA && newB) {
        newA.order = b.order;
        newB.order = a.order;
      }
      return updated.sort((x, y) => x.order - y.order);
    });
    fetchProjects();
  };

  // ─── Render ──────────────────────────────────────
  const inputClasses =
    'w-full rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors';

  return (
    <section className="min-h-screen bg-linear-to-b from-neutral-50 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 text-neutral-900 dark:text-white p-6 pt-40 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium"
          >
            <FiArrowLeft className="text-lg" />
            Retour
          </Link>
          <Button onClick={openNew}>
            <FiPlus size={18} />
            Nouveau projet
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center text-brand-500 dark:text-brand-400">
          Gestion des Projets
        </h1>

        {/* Projects list */}
        {loading ? (
          <div className="text-center text-neutral-400 py-20">Chargement...</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-neutral-400 py-20">
            <p className="text-lg mb-4">Aucun projet pour le moment.</p>
            <Button onClick={openNew}>
              <FiPlus size={16} />
              Ajouter ton premier projet
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4">
              <SortableContext items={projects} strategy={verticalListSortingStrategy}>
                {projects.map((project, idx) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    idx={idx}
                    projectsLength={projects.length}
                    moveProject={moveProject}
                    toggleVisibility={toggleVisibility}
                    openEdit={openEdit}
                    setDeleteTarget={setDeleteTarget}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </motion.div>

      {/* ─── Form Modal ───────────────────────────── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Modifier le projet' : 'Nouveau projet'}
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full transition-colors cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium mb-1">Titre *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className={`${inputClasses} ${formErrors.title ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    placeholder="Mon super projet"
                  />
                  {formErrors.title && (
                    <p className="text-danger-500 text-xs mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={`${inputClasses} resize-none ${formErrors.description ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    rows={3}
                    placeholder="Description du projet..."
                  />
                  {formErrors.description && (
                    <p className="text-danger-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Gradient */}
                <div>
                  <label className="block text-sm font-medium mb-2">Couleur</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, gradient: g.value }))}
                        className={`h-10 w-16 rounded-lg bg-gradient-to-br ${g.value} border-2 transition-all cursor-pointer ${
                          form.gradient === g.value
                            ? 'border-brand-500 ring-2 ring-brand-500/30'
                            : 'border-transparent hover:border-neutral-400'
                        }`}
                        title={g.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Liens */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lien projet</label>
                    <input
                      type="url"
                      value={form.link}
                      onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                      className={`${inputClasses} ${formErrors.link ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      placeholder="https://..."
                    />
                    {formErrors.link && (
                      <p className="text-danger-500 text-xs mt-1">{formErrors.link}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lien GitHub</label>
                    <input
                      type="url"
                      value={form.github}
                      onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
                      className={`${inputClasses} ${formErrors.github ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                      placeholder="https://github.com/..."
                    />
                    {formErrors.github && (
                      <p className="text-danger-500 text-xs mt-1">{formErrors.github}</p>
                    )}
                  </div>
                </div>

                {/* Compétences */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Compétences / Technologies
                  </label>
                  <div className="relative">
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
                            addSkill(suggestions[selectedIndex]);
                          } else if (skillInput.trim()) {
                            addSkill(skillInput.trim());
                          }
                        } else if (e.key === 'Escape') {
                          setSuggestions([]);
                          setSelectedIndex(-1);
                        }
                      }}
                      className={inputClasses}
                      placeholder="Tape un nom de techno (React, Docker...)..."
                    />
                    {/* Autocomplete dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {suggestions.map((s, idx) => {
                          const entry = SKILL_ICONS[s];
                          const Icon = entry?.icon;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => addSkill(s)}
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
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Appuie sur Entrée pour ajouter. Les icônes sont détectées automatiquement.
                  </p>

                  {/* Skills display */}
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.skills.map((skill, i) => {
                        const match = SKILL_ICONS[skill.name.toLowerCase()];
                        const Icon = match?.icon;
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm font-medium"
                          >
                            {Icon && (
                              <Icon
                                size={14}
                                style={{
                                  color: isDark ? match.color : match.colorLight || match.color,
                                }}
                              />
                            )}
                            {skill.name}
                            <button
                              type="button"
                              onClick={() => removeSkill(i)}
                              className="ml-1 text-neutral-400 hover:text-danger-500 cursor-pointer"
                            >
                              <FiX size={14} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Visibilité */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.visible}
                      onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-neutral-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                  <span className="text-sm font-medium">
                    {form.visible ? 'Visible sur le portfolio' : 'Masqué (brouillon)'}
                  </span>
                </div>

                {/* Images Manager */}
                <div className="pt-4 mt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-bold mb-3">Galerie d&apos;images</h3>
                  {!editingId ? (
                    <p className="text-sm text-neutral-500 italic">
                      Veuillez d&apos;abord créer et sauvegarder le projet pour ajouter des images.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <label className="relative cursor-pointer bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                          {isUploadingImage ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                          ) : (
                            <FiPlus size={18} />
                          )}
                          <span>Ajouter des images (max 10MB)</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                          />
                        </label>
                      </div>

                      {existingImages.length > 0 && (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleImageDragEnd}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <SortableContext items={existingImages} strategy={rectSortingStrategy}>
                              {existingImages.map((img, idx) => (
                                <SortableImageItem
                                  key={img.id}
                                  img={img}
                                  idx={idx}
                                  total={existingImages.length}
                                  onMoveUp={(e) => {
                                    e.stopPropagation();
                                    moveImage(img.id, 'up');
                                  }}
                                  onMoveDown={(e) => {
                                    e.stopPropagation();
                                    moveImage(img.id, 'down');
                                  }}
                                  onDelete={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(img.id);
                                  }}
                                />
                              ))}
                            </SortableContext>
                          </div>
                        </DndContext>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText={editingId ? 'Modification...' : 'Création...'}
                  fullWidth
                  className="mt-4"
                >
                  {editingId ? 'Enregistrer les modifications' : 'Créer le projet'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le projet"
        message={`Le projet "${deleteTarget?.title}" sera supprimé définitivement.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </section>
  );
}
