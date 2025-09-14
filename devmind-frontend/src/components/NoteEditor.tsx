"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { lowlight } from "lowlight";
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Pin,
  Archive,
  Trash2,
  Save,
  Tag,
  Calendar,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn, formatDateTime } from "~/lib/utils";
import { type Note } from "~/lib/api";
import { AIAssistant } from "./AIAssistant";

interface NoteEditorProps {
  note: Note | null;
  onSave: (id: number, updates: Partial<Note>) => void;
  onDelete: (id: number) => void;
}

export function NoteEditor({ note, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: "",
    onUpdate: () => {
      setHasChanges(true);
    },
  });

  // Update editor content when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setTags(JSON.parse(note.tags || "[]"));
      if (editor && note.content !== editor.getHTML()) {
        editor.commands.setContent(note.content);
      }
      setHasChanges(false);
    } else {
      setTitle("");
      setTags([]);
      if (editor) {
        editor.commands.setContent("");
      }
      setHasChanges(false);
    }
  }, [note, editor]);

  const handleSave = useCallback(() => {
    if (!note || !editor) return;

    const content = editor.getHTML();
    onSave(note.id, {
      title: title || "Untitled Note",
      content,
      tags: JSON.stringify(tags),
    });
    setHasChanges(false);
  }, [note, editor, title, tags, onSave]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasChanges(true);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setHasChanges(true);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setHasChanges(true);
  };

  const togglePin = () => {
    if (!note) return;
    onSave(note.id, { isPinned: !note.isPinned });
  };

  const toggleArchive = () => {
    if (!note) return;
    onSave(note.id, { isArchived: !note.isArchived });
  };

  const handleDelete = () => {
    if (!note) return;
    if (confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id);
    }
  };

  const handleAISuggestion = (suggestion: string) => {
    if (editor) {
      editor.commands.setContent(suggestion);
      setHasChanges(true);
    }
  };

  const handleAITagsGenerated = (aiTags: string[]) => {
    const newTags = [...new Set([...tags, ...aiTags])];
    setTags(newTags);
    setHasChanges(true);
  };

  const handleAITitleSuggested = (aiTitle: string) => {
    setTitle(aiTitle);
    setHasChanges(true);
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No note selected</h3>
          <p>Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title..."
              className="text-2xl font-bold bg-transparent border-none outline-none flex-1 text-gray-900 placeholder-gray-400"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  hasChanges
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={togglePin}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  note.isPinned
                    ? "bg-yellow-100 text-yellow-700"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <Pin className="h-4 w-4" />
              </button>
              <button
                onClick={toggleArchive}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  note.isArchived
                    ? "bg-gray-100 text-gray-700"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="px-2 py-1 text-xs border border-gray-300 rounded-full outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {formatDateTime(note.createdAt)}
            </span>
            {note.updatedAt !== note.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Updated {formatDateTime(note.updatedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        {editor && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn(
                    "p-2 rounded hover:bg-gray-200 transition-colors",
                    editor.isActive("bold") && "bg-gray-200"
                  )}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn(
                    "p-2 rounded hover:bg-gray-200 transition-colors",
                    editor.isActive("italic") && "bg-gray-200"
                  )}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn(
                    "p-2 rounded hover:bg-gray-200 transition-colors",
                    editor.isActive("code") && "bg-gray-200"
                  )}
                >
                  <Code className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn(
                    "p-2 rounded hover:bg-gray-200 transition-colors",
                    editor.isActive("bulletList") && "bg-gray-200"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={cn(
                    "p-2 rounded hover:bg-gray-200 transition-colors",
                    editor.isActive("orderedList") && "bg-gray-200"
                  )}
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn(
                    "p-2 rounded hover:bg-gray-200 transition-colors",
                    editor.isActive("blockquote") && "bg-gray-200"
                  )}
                >
                  <Quote className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Redo className="h-4 w-4" />
                </button>
              </div>

              {/* AI Assistant */}
              <AIAssistant
                content={editor.getHTML() + " " + title}
                onSuggestion={handleAISuggestion}
                onTagsGenerated={handleAITagsGenerated}
                onTitleSuggested={handleAITitleSuggested}
              />
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}