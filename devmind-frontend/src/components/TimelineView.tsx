"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, CheckCircle, Circle, Edit2, Trash2 } from "lucide-react";
import { api, type Timeline, type Milestone } from "~/lib/api";
import { cn, formatDate } from "~/lib/utils";

export function TimelineView() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimelines();
  }, []);

  const loadTimelines = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTimelines();
      setTimelines(data);
      if (data.length > 0 && !selectedTimeline) {
        setSelectedTimeline(data[0]);
      }
    } catch (error) {
      console.error("Failed to load timelines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTimeline = async (title: string, description: string) => {
    try {
      const newTimeline = await api.createTimeline({
        title,
        description,
        milestones: JSON.stringify([]),
      });
      setTimelines([newTimeline, ...timelines]);
      setSelectedTimeline(newTimeline);
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create timeline:", error);
    }
  };

  const updateTimeline = async (timeline: Timeline) => {
    try {
      const updated = await api.updateTimeline(timeline.id, timeline);
      setTimelines(timelines.map((t) => (t.id === timeline.id ? updated : t)));
      setSelectedTimeline(updated);
    } catch (error) {
      console.error("Failed to update timeline:", error);
    }
  };

  const addMilestone = (timeline: Timeline) => {
    const milestones: Milestone[] = JSON.parse(timeline.milestones || "[]");
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: "New Milestone",
      date: new Date().toISOString().split("T")[0],
      completed: false,
    };
    
    const updatedTimeline = {
      ...timeline,
      milestones: JSON.stringify([...milestones, newMilestone]),
    };
    
    updateTimeline(updatedTimeline);
    setEditingMilestone(newMilestone.id);
  };

  const updateMilestone = (timeline: Timeline, milestoneId: string, updates: Partial<Milestone>) => {
    const milestones: Milestone[] = JSON.parse(timeline.milestones || "[]");
    const updatedMilestones = milestones.map((m) =>
      m.id === milestoneId ? { ...m, ...updates } : m
    );
    
    const updatedTimeline = {
      ...timeline,
      milestones: JSON.stringify(updatedMilestones),
    };
    
    updateTimeline(updatedTimeline);
  };

  const deleteMilestone = (timeline: Timeline, milestoneId: string) => {
    const milestones: Milestone[] = JSON.parse(timeline.milestones || "[]");
    const updatedMilestones = milestones.filter((m) => m.id !== milestoneId);
    
    const updatedTimeline = {
      ...timeline,
      milestones: JSON.stringify(updatedMilestones),
    };
    
    updateTimeline(updatedTimeline);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Timeline Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Timelines</h2>
            <button
              onClick={() => setIsCreating(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isCreating && (
            <CreateTimelineForm
              onSubmit={createTimeline}
              onCancel={() => setIsCreating(false)}
            />
          )}
          
          <div className="space-y-2">
            {timelines.map((timeline) => (
              <button
                key={timeline.id}
                onClick={() => setSelectedTimeline(timeline)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-colors border",
                  selectedTimeline?.id === timeline.id
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                )}
              >
                <h3 className="font-medium text-gray-900">{timeline.title}</h3>
                {timeline.description && (
                  <p className="text-sm text-gray-600 mt-1">{timeline.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(timeline.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 bg-gray-50">
        {selectedTimeline ? (
          <TimelineContent
            timeline={selectedTimeline}
            onAddMilestone={() => addMilestone(selectedTimeline)}
            onUpdateMilestone={(milestoneId, updates) =>
              updateMilestone(selectedTimeline, milestoneId, updates)
            }
            onDeleteMilestone={(milestoneId) =>
              deleteMilestone(selectedTimeline, milestoneId)
            }
            editingMilestone={editingMilestone}
            setEditingMilestone={setEditingMilestone}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No timeline selected</h3>
              <p>Create a timeline to start tracking milestones</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CreateTimelineFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

function CreateTimelineForm({ onSubmit, onCancel }: CreateTimelineFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Timeline title..."
        className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)..."
        className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        rows={2}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface TimelineContentProps {
  timeline: Timeline;
  onAddMilestone: () => void;
  onUpdateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  editingMilestone: string | null;
  setEditingMilestone: (id: string | null) => void;
}

function TimelineContent({
  timeline,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  editingMilestone,
  setEditingMilestone,
}: TimelineContentProps) {
  const milestones: Milestone[] = JSON.parse(timeline.milestones || "[]");
  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{timeline.title}</h1>
            {timeline.description && (
              <p className="text-gray-600 mt-1">{timeline.description}</p>
            )}
          </div>
          <button
            onClick={onAddMilestone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </button>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                isEditing={editingMilestone === milestone.id}
                onEdit={() => setEditingMilestone(milestone.id)}
                onSave={(updates) => {
                  onUpdateMilestone(milestone.id, updates);
                  setEditingMilestone(null);
                }}
                onCancel={() => setEditingMilestone(null)}
                onDelete={() => onDeleteMilestone(milestone.id)}
                onToggleComplete={() =>
                  onUpdateMilestone(milestone.id, { completed: !milestone.completed })
                }
              />
            ))}
          </div>

          {sortedMilestones.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No milestones yet</p>
              <p className="text-sm">Add your first milestone to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MilestoneItemProps {
  milestone: Milestone;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Milestone>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

function MilestoneItem({
  milestone,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleComplete,
}: MilestoneItemProps) {
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description || "");
  const [date, setDate] = useState(milestone.date);

  const handleSave = () => {
    onSave({
      title: title.trim() || "Untitled Milestone",
      description: description.trim(),
      date,
    });
  };

  if (isEditing) {
    return (
      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center relative z-10">
          <Edit2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            rows={2}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start gap-4 group">
      <button
        onClick={onToggleComplete}
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors",
          milestone.completed
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-300 hover:bg-gray-400"
        )}
      >
        {milestone.completed ? (
          <CheckCircle className="h-5 w-5 text-white" />
        ) : (
          <Circle className="h-5 w-5 text-gray-600" />
        )}
      </button>
      
      <div className={cn(
        "flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-opacity",
        milestone.completed && "opacity-75"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-gray-900",
              milestone.completed && "line-through"
            )}>
              {milestone.title}
            </h3>
            {milestone.description && (
              <p className="text-gray-600 mt-1">{milestone.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">{formatDate(milestone.date)}</p>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}