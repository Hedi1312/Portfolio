'use client';

import { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPlay,
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
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { SKILL_ICONS, findSkillIcon } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';
import { z } from 'zod';
import { directUploadToCloudinary } from '@/lib/cloudinary-client';
import type { Modifier } from '@dnd-kit/core';
import { FolderKanban } from 'lucide-react';

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

  return {
    ...transform,
    x: 0,
    y: Math.min(Math.max(transform.y, minY), maxY),
  };
};

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
  const isDark = useIsDark();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, position: 'relative' as const } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-[box-shadow,border-color,background-color] cursor-grab active:cursor-grabbing touch-pan-y ${
        !project.visible ? 'opacity-50 saturate-50' : ''
      } ${isDragging ? 'shadow-2xl ring-2 ring-brand-500/50 z-50 relative' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Visual Drag Handle */}
        <div className="mt-1 text-neutral-400 hover:text-brand-500 p-1 shrink-0 opacity-50 hover:opacity-100 transition-opacity">
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
              {project.skills.map((skill) => {
                const match = findSkillIcon(skill.icon || skill.name);
                const Icon = match?.icon;

                const color = isDark
                  ? match?.color || skill.color || '#00D5BE'
                  : match?.colorLight || match?.color || skill.color || '#00D5BE';

                return (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-brand-400/10 text-brand-600 dark:text-brand-400 border border-brand-400/20 shadow-sm"
                  >
                    {Icon && <Icon size={10} style={{ color }} className="mr-0.5" />}
                    {skill.name}
                  </span>
                );
              })}
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
  onPreview,
}: {
  img: ProjectImage;
  idx: number;
  total: number;
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onPreview: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, position: 'relative' as const } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-video rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 touch-none ${
        isDragging ? 'shadow-xl ring-2 ring-brand-500/50' : ''
      }`}
    >
      {/* Full Card Drag Hitbox */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
        {...attributes}
        {...listeners}
      />

      {/* Hamburger Visual Indicator */}
      <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-md rounded-md p-1.5 text-white/90 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <FiMenu size={14} />
      </div>
      {img.url.match(/\.(mp4|webm|mov|avi)$/i) ? (
        <>
          <video
            src={img.url}
            className="w-full h-full object-cover pointer-events-none"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 p-3 rounded-full text-white backdrop-blur-sm shadow-lg border border-white/20">
              <FiPlay fill="currentColor" size={20} className="ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        <Image
          src={img.url}
          alt="Project media"
          width={400}
          height={225}
          className="w-full h-full object-cover pointer-events-none"
        />
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none">
        <div className="flex gap-2 relative z-10 pointer-events-auto">
          <button
            type="button"
            onClick={onPreview}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-brand-500 transition-colors cursor-pointer"
            title="Aperçu"
          >
            <FiEye size={16} />
          </button>
          <button
            type="button"
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

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [imageDeleteTarget, setImageDeleteTarget] = useState<ProjectImage | null>(null);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);

  useLockBodyScroll(formOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, formOpen);

  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const isDark = useIsDark();

  // Prevent background scrolling when form is open
  useLockBodyScroll(formOpen);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // ─── Skill autocomplete ──────────────────────────
  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    const search = value.toLowerCase().trim();
    if (search.length > 0) {
      // Filter keys matching either the key or the label
      const matchingKeys = Object.entries(SKILL_ICONS)
        .filter(([k, v]) => k.includes(search) || v.label.toLowerCase().includes(search))
        .map(([k]) => k);

      // Deduplicate by label to prevent identical entries
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
    const search = name.toLowerCase().trim();
    const matchData = Object.entries(SKILL_ICONS).find(
      ([k, v]) => k === search || v.label.toLowerCase() === search,
    );

    const canonicalName = matchData ? matchData[1].label : name;
    const canonicalKey = matchData ? matchData[0] : null;

    const isDuplicate = form.skills.some(
      (s) =>
        s.name.toLowerCase() === canonicalName.toLowerCase() ||
        (s.icon && canonicalKey && s.icon === canonicalKey),
    );

    if (isDuplicate) {
      showToast('error', `"${canonicalName}" empêché : déjà ajouté.`);
      return;
    }

    const skill: Skill = {
      name: canonicalName,
      icon: canonicalKey,
      color: matchData ? matchData[1].color : '#00D5BE',
    };
    setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    showToast('success', `"${canonicalName}" ajouté.`);
    setSkillInput('');
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const removeSkill = (index: number) => {
    const removedName = form.skills[index].name;
    setForm((f) => ({ ...f, skills: f.skills.filter((_, i) => i !== index) }));
    showToast('success', `"${removedName}" retiré.`);
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
      const { createProjectAction, updateProjectAction } = await import('@/actions/project.action');
      let res;
      if (editingId) {
        res = await updateProjectAction(editingId, form);
      } else {
        res = await createProjectAction(form);
      }

      if (res.success) {
        showToast(
          'success',
          editingId ? `Projet "${form.title}" modifié !` : `Projet "${form.title}" créé !`,
        );
        setFormOpen(false);
        setForm(defaultForm);
        setEditingId(null);
      } else {
        showToast('error', res.error || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      showToast('error', 'Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { deleteProjectAction } = await import('@/actions/project.action');
      const res = await deleteProjectAction(deleteTarget.id);

      if (res.success) {
        showToast('success', `Projet "${deleteTarget.title}" supprimé.`);
        setDeleteTarget(null);
      } else {
        showToast('error', res.error || 'Erreur lors de la suppression.');
      }
    } catch {
      showToast('error', 'Erreur réseau lors de la suppression.');
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

    const { updateProjectAction } = await import('@/actions/project.action');

    // Swap orders
    await Promise.all([
      updateProjectAction(a.id, { ...a, order: b.order }),
      updateProjectAction(b.id, { ...b, order: a.order }),
    ]);
  };

  // ─── Drag and Drop ───────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
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
      // Save order to API in background
      const { updateProjectAction } = await import('@/actions/project.action');
      const updates = newProjects.map((p, i) => {
        if (p.order !== i) {
          return updateProjectAction(p.id, { ...p, order: i });
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(updates);
      } catch {
        showToast('error', "Erreur lors de la sauvegarde de l'ordre.");
        setProjects(initialProjects); // revert to original server state
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
      const { updateProjectImageOrderAction } = await import('@/actions/project.action');
      const updates = newImages.map((img, i) => {
        if (img.order !== i) {
          img.order = i;
          return updateProjectImageOrderAction(editingId, img.id, i);
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(updates);
      } catch {
        showToast('error', "Erreur lors de la sauvegarde de l'ordre des images.");
      }
    }
  };

  const toggleVisibility = async (project: Project) => {
    const { updateProjectAction } = await import('@/actions/project.action');
    await updateProjectAction(project.id, { ...project, visible: !project.visible });
  };

  // ─── Image Management ─────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingId) return;

    const filesArr = Array.from(e.target.files);

    // Validation Client-Side stricte
    let hasError = false;
    for (const file of filesArr) {
      if (file.type.startsWith('video/') && file.size > 100 * 1024 * 1024) {
        showToast('error', `La vidéo dépasse 100 Mo.`);
        hasError = true;
      } else if (file.type.startsWith('image/') && file.size > 15 * 1024 * 1024) {
        showToast('error', `L'image dépasse 15 Mo.`);
        hasError = true;
      } else if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
        showToast('error', `Format non supporté (Images/Vidéos uniquement).`);
        hasError = true;
      }
    }

    if (hasError) {
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);

    try {
      // Compression parallèle
      const compressedFiles = await Promise.all(
        filesArr.map(async (file) => {
          if (!file.type.startsWith('image/')) return file;

          try {
            const options = {
              maxSizeMB: 1, // Heavily restrict maximum file size
              maxWidthOrHeight: 1920, // Résolution Full HD max
              useWebWorker: true,
              fileType: file.type,
            };
            const imageCompression = (await import('browser-image-compression')).default;
            const compressedBlob = await imageCompression(file, options);

            // Create a valid File object from Blob for FormData
            return new File([compressedBlob], file.name, {
              type: compressedBlob.type || file.type,
              lastModified: Date.now(),
            });
          } catch (_error) {
            return file; // Si échec, on renvoie l'original
          }
        }),
      );

      // Direct upload to Cloudinary for each file
      const uploadedImages = await Promise.all(
        compressedFiles.map((file) => directUploadToCloudinary(file, { subfolder: 'projets' })),
      );

      const { addProjectImagesAction } = await import('@/actions/project.action');
      const res = await addProjectImagesAction(editingId, { images: uploadedImages });

      if (res.success && res.data) {
        setExistingImages((prev) => [...prev, ...(res.data as ProjectImage[])]);
        showToast('success', 'Média(s) ajouté(s) !');
      } else {
        showToast('error', res.error || 'Erreur lors du telechargement.');
      }
    } catch {
      showToast('error', 'Erreur reseau lors du telechargement.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const confirmDeleteImage = async (imageId: string) => {
    if (!editingId) return;
    try {
      const { deleteProjectImageAction } = await import('@/actions/project.action');
      const res = await deleteProjectImageAction(editingId, imageId);

      if (res.success) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        showToast('success', 'Image supprimée avec succès.');
        setImageDeleteTarget(null);
      } else {
        showToast('error', res.error || 'Erreur serveur.');
      }
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    }
  };

  const handleDeleteImage = (img: ProjectImage) => {
    setImageDeleteTarget(img);
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

    const { updateProjectImageOrderAction } = await import('@/actions/project.action');

    // Save order
    await Promise.all([
      updateProjectImageOrderAction(editingId, a.id, b.order),
      updateProjectImageOrderAction(editingId, b.id, a.order),
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
  };

  // ─── Render ──────────────────────────────────────
  const inputClasses =
    'w-full rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors';

  return (
    <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
      <m.div
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
                <FolderKanban className="text-brand-500" />
                Gestion des Projets
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Gérez vos réalisations et leur ordre d&apos;affichage
              </p>
            </div>
          </div>
          <Button onClick={openNew}>
            <FiPlus size={18} />
            Nouveau projet
          </Button>
        </div>

        {/* Projects list */}
        {projects.length === 0 ? (
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
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
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
      </m.div>

      {/* ─── Form Modal ───────────────────────────── */}
      <AnimatePresence>
        {formOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setFormOpen(false)}
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              ref={modalRef}
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

              <div
                className={`space-y-5 transition-all duration-300 ${
                  saving || isUploadingImage
                    ? 'opacity-60 saturate-[0.5] pointer-events-none'
                    : 'opacity-100 saturate-100'
                }`}
              >
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium mb-1">Titre *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className={`${inputClasses} ${formErrors.title ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    placeholder="Mon super projet"
                    disabled={saving || isUploadingImage}
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
                    disabled={saving || isUploadingImage}
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
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={g.label}
                        disabled={saving || isUploadingImage}
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
                      disabled={saving || isUploadingImage}
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
                      disabled={saving || isUploadingImage}
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
                      placeholder="Ajouter une technologie (React, Docker...)"
                      disabled={saving || isUploadingImage}
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
                        const match = findSkillIcon(skill.icon || skill.name);
                        const Icon = match?.icon;
                        const color = isDark
                          ? match?.color || skill.color || '#00D5BE'
                          : match?.colorLight || match?.color || skill.color || '#00D5BE';

                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm font-medium"
                          >
                            {Icon && <Icon size={14} style={{ color }} />}
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
                      disabled={saving || isUploadingImage}
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
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                        <Button
                          variant="primary"
                          className="w-full"
                          isLoading={isUploadingImage}
                          loadingText="Chargement..."
                          disabled={saving}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FiPlus size={18} />
                          Ajouter des médias (Photos/Vidéos max 100MB)
                        </Button>
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
                                    if (saving || isUploadingImage) return;
                                    e.stopPropagation();
                                    moveImage(img.id, 'up');
                                  }}
                                  onMoveDown={(e) => {
                                    if (saving || isUploadingImage) return;
                                    e.stopPropagation();
                                    moveImage(img.id, 'down');
                                  }}
                                  onDelete={(e) => {
                                    if (saving || isUploadingImage) return;
                                    e.stopPropagation();
                                    handleDeleteImage(img);
                                  }}
                                  onPreview={(e) => {
                                    e.stopPropagation();
                                    setPreviewMedia(img.url);
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
                  disabled={isUploadingImage}
                  fullWidth
                  className="mt-4"
                >
                  {editingId ? 'Enregistrer les modifications' : 'Créer le projet'}
                </Button>
              </div>
            </m.div>
          </m.div>
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

      <ConfirmModal
        isOpen={!!imageDeleteTarget}
        title="Supprimer l'image"
        message="Cette image sera supprimée définitivement du projet."
        onConfirm={() => imageDeleteTarget && confirmDeleteImage(imageDeleteTarget.id)}
        onCancel={() => setImageDeleteTarget(null)}
      />

      {/* Media Preview Lightbox */}
      <AnimatePresence>
        {previewMedia && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setPreviewMedia(null)}
          >
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FiX size={24} />
            </button>
            <div
              className="relative w-full max-w-5xl h-full max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {previewMedia.match(/\.(mp4|webm|mov|avi)$/i) ? (
                <video
                  src={previewMedia}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  autoPlay
                  controls
                  playsInline
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={previewMedia}
                    alt="Media Preview"
                    fill
                    className="object-contain drop-shadow-2xl"
                    sizes="100vw"
                    priority
                  />
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <ToastContainer toast={toast} onClose={hideToast} />
    </section>
  );
}
