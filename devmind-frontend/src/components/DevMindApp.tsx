"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { NoteEditor } from "./NoteEditor";
import { SearchBar } from "./SearchBar";
import { TimelineView } from "./TimelineView";
import { MindMapView } from "./MindMapView";
import { api, type Note, type Tag } from "~/lib/api";
import { Brain, FileText, Clock, Map, Settings, MessageSquare, Mic, FileTemplate, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { AIProviderSettings } from "./AIProviderSettings";
import { AIChatAssistant } from "./AIChatAssistant";
import { VoiceNotes } from "./VoiceNotes";
import { SmartTemplates } from "./SmartTemplates";

type View = "notes" | "timeline" | "mindmap";

export function DevMindApp() {
  const [currentView, setCurrentView] = useState<View>("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // v2.0 state
  const [showAISettings, setShowAISettings] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showVoiceNotes, setShowVoiceNotes] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load notes when search/filter changes
  useEffect(() => {
    loadNotes();
  }, [searchQuery, selectedTags]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [notesData, tagsData] = await Promise.all([
        api.getNotes(),
        api.getTags(),
      ]);
      setNotes(notesData);
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const notesData = await api.getNotes({
        search: searchQuery || undefined,
        tag: selectedTags.length > 0 ? selectedTags[0] : undefined,
      });
      setNotes(notesData);
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  const createNote = async (title?: string, content?: string) => {
    try {
      const newNote = await api.createNote({
        title: title || "Untitled Note",
        content: content || "",
        contentType: "markdown",
        tags: "[]",
      });
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setCurrentView("notes");
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleVoiceTranscription = (transcription: string, title?: string) => {
    createNote(title, transcription);
    setShowVoiceNotes(false);
  };

  const handleTemplateSelect = (template: any) => {
    createNote(template.name, template.content);
    setShowTemplates(false);
  };

  const insertTextIntoNote = (text: string) => {
    // This would be handled by the NoteEditor component
    // For now, we'll just show a placeholder
    console.log("Insert text:", text);
  };

  const updateNote = async (id: number, updates: Partial<Note>) => {
    try {
      const updatedNote = await api.updateNote(id, updates);
      setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await api.deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "notes":
        return (
          <NoteEditor
            note={selectedNote}
            onSave={updateNote}
            onDelete={deleteNote}
          />
        );
      case "timeline":
        return <TimelineView />;
      case "mindmap":
        return <MindMapView />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">DevMind</h1>
            </div>
            <ThemeToggle />
          </div>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes..."
          />
        </div>

        {/* Navigation */}
        <div className="p-4 border-b border-gray-200">
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentView("notes")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "notes"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FileText className="h-4 w-4" />
              Notes
            </button>
            <button
              onClick={() => setCurrentView("timeline")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "timeline"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Clock className="h-4 w-4" />
              Timeline
            </button>
            <button
              onClick={() => setCurrentView("mindmap")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "mindmap"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Map className="h-4 w-4" />
              Mind Maps
            </button>
          </nav>
        </div>

        <Sidebar
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onCreateNote={() => createNote()}
          tags={tags}
          selectedTags={selectedTags}
          onTagSelect={setSelectedTags}
        />

        {/* v2.0 Action Buttons */}
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <FileTemplate className="h-4 w-4" />
              Smart Templates
            </button>
            <button
              onClick={() => setShowVoiceNotes(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Mic className="h-4 w-4" />
              Voice Notes
            </button>
            <button
              onClick={() => setShowAIChat(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              AI Assistant
            </button>
            <button
              onClick={() => setShowAISettings(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              AI Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {renderView()}
      </div>

      {/* v2.0 Modals and Overlays */}
      <AIProviderSettings
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />
      
      <AIChatAssistant
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        context={{
          noteContent: selectedNote?.content,
          noteTitle: selectedNote?.title,
        }}
        onInsertText={insertTextIntoNote}
        onCreateNote={createNote}
      />

      <SmartTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Voice Notes Modal */}
      {showVoiceNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowVoiceNotes(false)}
          />
          <div className="relative w-full max-w-md bg-card rounded-xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Voice Notes</h3>
              <button
                onClick={() => setShowVoiceNotes(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <VoiceNotes onTranscriptionComplete={handleVoiceTranscription} />
          </div>
        </div>
      )}
    </div>
  );
}