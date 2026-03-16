'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowLeft,
  FiMail,
  FiTrash2,
  FiSend,
  FiPaperclip,
  FiDownload,
  FiX,
  FiInbox,
} from 'react-icons/fi';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface Attachment {
  filename: string;
  path: string;
}

interface Reply {
  id: string;
  message: string;
  attachments: Attachment[];
  createdAt: string;
}

interface Message {
  id: string;
  message: string;
  attachments: Attachment[];
  isRead: boolean;
  createdAt: string;
  replies: Reply[];
}

interface Contact {
  id: string;
  email: string;
  name: string;
  updatedAt: string;
  messages: Message[];
}

function isImage(filename: string) {
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(filename);
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyFileError, setReplyFileError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
  const MAX_FILES = 3;

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch {
      console.error('Erreur chargement contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const selectContact = async (contact: Contact) => {
    // Garder l'état original pour le séparateur non-lu
    setSelected(contact);
    setReplyText('');
    setReplyFiles([]);
    setReplyFileError('');

    const hasUnread = contact.messages.some((m) => !m.isRead);
    if (hasUnread) {
      await fetch(`/api/admin/messages/${contact.id}`, { method: 'PATCH' });
      // Marquer comme lu dans la liste (sidebar)
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contact.id
            ? { ...c, messages: c.messages.map((m) => ({ ...m, isRead: true })) }
            : c,
        ),
      );
      // Mettre à jour la cloche de la navbar
      window.dispatchEvent(new Event('unread-updated'));
    }
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteTarget(null);
    window.dispatchEvent(new Event('unread-updated'));
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('message', replyText);
      replyFiles.forEach((f) => formData.append('files', f));

      const res = await fetch(`/api/admin/messages/${selected.id}/reply`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newReply: Reply = data.reply;
        // Ajouter la réponse au dernier message du contact
        setSelected((prev) => {
          if (!prev) return null;
          const msgs = [...prev.messages];
          const lastIdx = msgs.length - 1;
          msgs[lastIdx] = {
            ...msgs[lastIdx],
            replies: [...msgs[lastIdx].replies, newReply],
          };
          return { ...prev, messages: msgs };
        });
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id !== selected.id) return c;
            const msgs = [...c.messages];
            const lastIdx = msgs.length - 1;
            msgs[lastIdx] = {
              ...msgs[lastIdx],
              replies: [...msgs[lastIdx].replies, newReply],
            };
            return { ...c, messages: msgs };
          }),
        );
        setReplyText('');
        setReplyFiles([]);
        showToast('success', 'Réponse envoyée avec succès !');
      } else {
        const data = await res.json();
        showToast('error', data.error || "Erreur lors de l'envoi.");
      }
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const formatFull = (dateStr: string) =>
    new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const totalUnread = contacts.reduce(
    (sum, c) => sum + c.messages.filter((m) => !m.isRead).length,
    0,
  );

  const getContactUnread = (c: Contact) => c.messages.filter((m) => !m.isRead).length;

  const renderAttachments = (attachments: Attachment[]) => {
    if (attachments.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        {attachments.map((att, i) => (
          <div
            key={i}
            className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-900/30"
          >
            {isImage(att.filename) ? (
              <a href={att.path} target="_blank" rel="noopener noreferrer" className="block">
                <Image
                  src={att.path}
                  alt={att.filename}
                  width={400}
                  height={160}
                  className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                />
              </a>
            ) : att.filename.toLowerCase().endsWith('.pdf') ? (
              <a
                href={att.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-32 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <span className="text-xs text-neutral-500">Voir le PDF</span>
                </div>
              </a>
            ) : null}
            <div className="flex items-center justify-between px-2.5 py-2">
              <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate flex-1">
                {att.filename}
              </span>
              <a
                href={att.path}
                download={att.filename}
                className="p-1 text-neutral-400 hover:text-brand-500 transition-colors"
              >
                <FiDownload size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-background transition-colors duration-300 pt-24 px-4 md:px-8 pb-12">
      <ToastContainer toast={toast} onClose={hideToast} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium"
            >
              <FiArrowLeft className="text-lg" />
              Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
              Messages
              {totalUnread > 0 && (
                <span className="ml-3 text-sm font-bold bg-danger-500 text-white px-2.5 py-1 rounded-full">
                  {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                </span>
              )}
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
            Chargement...
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20">
            <FiInbox size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">Aucun message reçu</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Liste des contacts */}
            <div className="w-full lg:w-2/5 space-y-3">
              {contacts.map((contact) => {
                const unread = getContactUnread(contact);
                const lastMsg = contact.messages[contact.messages.length - 1];
                return (
                  <motion.div
                    key={contact.id}
                    onClick={() => selectContact(contact)}
                    className={`relative cursor-pointer rounded-xl p-4 transition-all border ${
                      selected?.id === contact.id
                        ? 'bg-brand-500/10 border-brand-500/30'
                        : unread > 0
                          ? 'bg-white dark:bg-neutral-800 border-brand-400/30 hover:bg-brand-50 dark:hover:bg-neutral-700/80 shadow-sm'
                          : 'bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {unread > 0 && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-400 rounded-full" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 pl-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`truncate ${
                              unread > 0
                                ? 'text-neutral-900 dark:text-white font-bold'
                                : 'text-neutral-700 dark:text-neutral-300 font-medium'
                            }`}
                          >
                            {contact.name}
                          </span>
                          {unread > 0 && (
                            <span className="bg-brand-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                              {unread}
                            </span>
                          )}
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0 ml-auto">
                            {formatDate(contact.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-1 truncate">{contact.email}</p>
                        {lastMsg && (
                          <p
                            className={`text-sm truncate ${
                              unread > 0
                                ? 'text-neutral-700 dark:text-neutral-300'
                                : 'text-neutral-500 dark:text-neutral-500'
                            }`}
                          >
                            {lastMsg.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {contact.messages.length > 1 && (
                            <span className="text-xs text-neutral-400">
                              {contact.messages.length} messages
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: contact.id, name: contact.name });
                        }}
                        className="p-1.5 text-neutral-400 hover:text-danger-500 transition-colors rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 cursor-pointer"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Détail de la conversation */}
            <div className="w-full lg:w-3/5">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden"
                  >
                    {/* Contact header */}
                    <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                          {selected.name}
                        </h2>
                        <a
                          href={`mailto:${selected.email}`}
                          className="text-sm text-brand-500 hover:underline"
                        >
                          {selected.email}
                        </a>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer lg:hidden"
                      >
                        <FiX size={20} />
                      </button>
                    </div>

                    {/* Conversation thread */}
                    <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                      {selected.messages.map((msg, msgIdx) => {
                        // Afficher le séparateur "Messages non lus" avant le premier message non lu
                        const isFirstUnread =
                          !msg.isRead && (msgIdx === 0 || selected.messages[msgIdx - 1].isRead);

                        return (
                          <div key={msg.id}>
                            {isFirstUnread && (
                              <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-danger-400" />
                                <span className="text-xs font-semibold text-danger-500 whitespace-nowrap">
                                  Messages non lus
                                </span>
                                <div className="flex-1 h-px bg-danger-400" />
                              </div>
                            )}

                            {/* Message entrant */}
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 shrink-0 mt-0.5">
                                {selected.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    {selected.name}
                                  </span>
                                  <span className="text-xs text-neutral-400">
                                    {formatFull(msg.createdAt)}
                                  </span>
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl rounded-tl-sm p-4 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">
                                  {msg.message}
                                </div>
                                {renderAttachments(msg.attachments)}
                              </div>
                            </div>

                            {/* Réponses */}
                            {msg.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3 mt-4 justify-end">
                                <div className="flex-1 min-w-0 max-w-[85%]">
                                  <div className="flex items-center gap-2 mb-1 justify-end">
                                    <span className="text-xs text-neutral-400">
                                      {formatFull(reply.createdAt)}
                                    </span>
                                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                                      Moi
                                    </span>
                                  </div>
                                  <div className="bg-brand-500/10 dark:bg-brand-500/15 border border-brand-200 dark:border-brand-800 rounded-xl rounded-tr-sm p-4 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">
                                    {reply.message}
                                  </div>
                                  {renderAttachments(reply.attachments)}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                                  H
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>

                    {/* Formulaire de réponse */}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 p-6">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        placeholder={`Répondre à ${selected.name}...`}
                        className="w-full p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none resize-none transition-all"
                      />

                      <div className="flex items-center justify-between mt-3 gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <label className="inline-flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 cursor-pointer rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <FiPaperclip size={16} />
                            <span className="hidden sm:inline">Joindre</span>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) {
                                  const filesArray = Array.from(e.target.files);
                                  if (filesArray.length > MAX_FILES) {
                                    setReplyFileError(`Maximum ${MAX_FILES} fichiers autorisés.`);
                                    setReplyFiles([]);
                                    e.target.value = '';
                                    return;
                                  }
                                  const tooBig = filesArray.filter((f) => f.size > MAX_FILE_SIZE);
                                  if (tooBig.length > 0) {
                                    setReplyFileError(
                                      `Max 5 Mo : ${tooBig.map((f) => f.name).join(', ')}`,
                                    );
                                    setReplyFiles([]);
                                    e.target.value = '';
                                    return;
                                  }
                                  setReplyFileError('');
                                  setReplyFiles(filesArray);
                                }
                              }}
                            />
                          </label>
                          {replyFileError && (
                            <span className="text-xs text-danger-500">{replyFileError}</span>
                          )}
                          {replyFiles.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {replyFiles.map((f, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-md"
                                >
                                  <FiPaperclip size={10} />
                                  {f.name}
                                  <button
                                    onClick={() =>
                                      setReplyFiles((prev) => prev.filter((_, j) => j !== i))
                                    }
                                    className="text-neutral-400 hover:text-danger-500 cursor-pointer"
                                  >
                                    <FiX size={12} />
                                  </button>
                                </span>
                              ))}
                              <button
                                onClick={() => setReplyFiles([])}
                                className="text-xs text-neutral-400 hover:text-danger-500 cursor-pointer ml-1"
                              >
                                Tout retirer
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={sendReply}
                          disabled={!replyText.trim() || sending}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <FiSend size={16} />
                          {sending ? 'Envoi...' : 'Envoyer'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden lg:flex items-center justify-center h-96 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl"
                  >
                    <div className="text-center text-neutral-400 dark:text-neutral-500">
                      <FiMail size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Sélectionne une conversation</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la conversation"
        message={`Toute la conversation avec ${deleteTarget?.name ?? ''} sera supprimée définitivement, y compris les messages et pièces jointes.`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => deleteTarget && deleteContact(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
