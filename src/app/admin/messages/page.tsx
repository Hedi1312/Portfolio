'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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

interface Attachment {
  filename: string;
  path: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  attachments: Attachment[];
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      console.error('Erreur chargement messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (msg: Message) => {
    if (!msg.isRead) {
      await fetch(`/api/admin/messages/${msg.id}`, { method: 'PATCH' });
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
    }
    setSelected({ ...msg, isRead: true });
    setReplyText('');
    setReplyFiles([]);
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
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
        setReplyText('');
        setReplyFiles([]);
        alert('Réponse envoyée !');
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'envoi.");
      }
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <section className="min-h-screen bg-background transition-colors duration-300 pt-24 px-4 md:px-8 pb-12">
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
              {unreadCount > 0 && (
                <span className="ml-3 text-sm font-bold bg-danger-500 text-white px-2.5 py-1 rounded-full">
                  {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
            Chargement...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <FiInbox size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">Aucun message reçu</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Liste des messages */}
            <div className="w-full lg:w-2/5 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  onClick={() => markAsRead(msg)}
                  className={`relative cursor-pointer rounded-xl p-4 transition-all border ${
                    selected?.id === msg.id
                      ? 'bg-brand-500/10 border-brand-500/30'
                      : msg.isRead
                        ? 'bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        : 'bg-white dark:bg-neutral-800 border-brand-400/30 hover:bg-brand-50 dark:hover:bg-neutral-700/80 shadow-sm'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {/* Barre latérale accent pour non lu */}
                  {!msg.isRead && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-400 rounded-full" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 pl-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`truncate ${
                            msg.isRead
                              ? 'text-neutral-700 dark:text-neutral-300 font-medium'
                              : 'text-neutral-900 dark:text-white font-bold'
                          }`}
                        >
                          {msg.name}
                        </span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          msg.isRead
                            ? 'text-neutral-500 dark:text-neutral-500'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {msg.message}
                      </p>
                      {msg.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-500 mt-1">
                          <FiPaperclip size={12} />
                          {msg.attachments.length} fichier{msg.attachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-danger-500 transition-colors rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 cursor-pointer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Détail du message */}
            <div className="w-full lg:w-3/5">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm"
                  >
                    {/* Entête */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                          {selected.name}
                        </h2>
                        <a
                          href={`mailto:${selected.email}`}
                          className="text-sm text-brand-500 hover:underline"
                        >
                          {selected.email}
                        </a>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(selected.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer lg:hidden"
                      >
                        <FiX size={20} />
                      </button>
                    </div>

                    {/* Message */}
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-5 mb-6 text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </div>

                    {/* Pièces jointes */}
                    {selected.attachments.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3 flex items-center gap-2">
                          <FiPaperclip size={14} />
                          Pièces jointes ({selected.attachments.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selected.attachments.map((att, i) => (
                            <a
                              key={i}
                              href={att.path}
                              download={att.filename}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                            >
                              <FiDownload size={14} />
                              {att.filename}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formulaire de réponse */}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                      <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3 flex items-center gap-2">
                        <FiMail size={14} />
                        Répondre à {selected.name}
                      </h3>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        placeholder="Écris ta réponse..."
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
                                  setReplyFiles(Array.from(e.target.files));
                                }
                              }}
                            />
                          </label>
                          {replyFiles.length > 0 && (
                            <span className="text-xs text-neutral-500 truncate">
                              {replyFiles.length} fichier{replyFiles.length > 1 ? 's' : ''}{' '}
                              sélectionné{replyFiles.length > 1 ? 's' : ''}
                            </span>
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
                      <p>Sélectionne un message pour le lire</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
