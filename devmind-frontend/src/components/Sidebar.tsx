"use client";

import { useState } from "react";
import { Plus, Pin, Archive, Tag, Calendar, FileText } from "lucide-react";
import { cn, formatDate } from "~/lib/utils";
import { type Note, type Tag } from "~/lib/api";

interface SidebarProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  tags: Tag[];
  selectedTags: string[];
  onTagSelect: (tags: string[]) => void;
}

export function Sidebar({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  tags,
  selectedTags,
  onTagSelect,
}: SidebarProps) {
  const [showArchived, setShowArchived] = useState(false);

  const filteredNotes = notes.filter((note) => {
    if (showArchived) return note.isArchived;
    return !note.isArchived;
  });

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const regularNotes = filteredNotes.filter((note) => !note.isPinned);

  const parseNoteTags = (tagsString: string): string[] => {
    try {
      return JSON.parse(tagsString || "[]");
    } catch {
      return [];
    }
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagSelect(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagSelect([...selectedTags, tagName]);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Create Note Button */}
      <div className="p-4">
        <button
          onClick={onCreateNote}
          className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                  selectedTags.includes(tag.name)
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Tag className="h-3 w-3" />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Archive Toggle */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            showArchived ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Show Active" : "Show Archived"}
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Pin className="h-3 w-3" />
              Pinned
            </h3>
            <div className="space-y-2">
              {pinnedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onClick={() => onSelectNote(note)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        {regularNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
            )}
            <div className="space-y-2">
              {regularNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onClick={() => onSelectNote(note)}
                />
              ))}
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notes found</p>
            <p className="text-sm">Create your first note to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

function NoteItem({ note, isSelected, onClick }: NoteItemProps) {
  const noteTags = JSON.parse(note.tags || "[]");
  const preview = note.content.slice(0, 100).replace(/[#*`]/g, "");

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg text-left transition-colors border",
        isSelected
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-gray-200 hover:bg-gray-50"
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-gray-900 truncate flex-1">
          {note.title}
        </h4>
        {note.isPinned && <Pin className="h-3 w-3 text-gray-400 ml-2" />}
      </div>
      
      {preview && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{preview}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(note.updatedAt || note.createdAt)}
        </span>
        
        {noteTags.length > 0 && (
          <div className="flex gap-1">
            {noteTags.slice(0, 2).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-gray-100 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {noteTags.length > 2 && (
              <span className="text-gray-400">+{noteTags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}