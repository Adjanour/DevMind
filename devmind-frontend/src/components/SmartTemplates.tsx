"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileTemplate,
  Code,
  BookOpen,
  Lightbulb,
  Target,
  Users,
  Calendar,
  CheckSquare,
  Sparkles,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  content: string;
  aiPrompt?: string;
  color: string;
}

interface SmartTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const templates: Template[] = [
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Structure for productive meeting documentation",
    category: "Business",
    icon: Users,
    color: "text-blue-600",
    content: `# Meeting Notes - [Meeting Title]

**Date:** [Date]
**Attendees:** [List attendees]
**Duration:** [Start time - End time]

## Agenda
- [ ] [Agenda item 1]
- [ ] [Agenda item 2]
- [ ] [Agenda item 3]

## Discussion Points
### [Topic 1]
- [Key points discussed]
- [Decisions made]

### [Topic 2]
- [Key points discussed]
- [Decisions made]

## Action Items
- [ ] [Action item] - Assigned to: [Person] - Due: [Date]
- [ ] [Action item] - Assigned to: [Person] - Due: [Date]

## Next Steps
- [Next meeting date]
- [Follow-up actions]

## Notes
[Additional notes and observations]`,
    aiPrompt: "Help me customize this meeting notes template for a [MEETING_TYPE] meeting about [TOPIC]",
  },
  {
    id: "project-planning",
    name: "Project Planning",
    description: "Comprehensive project planning template",
    category: "Planning",
    icon: Target,
    color: "text-green-600",
    content: `# Project Plan - [Project Name]

## Project Overview
**Project Goal:** [What you want to achieve]
**Timeline:** [Start date - End date]
**Budget:** [If applicable]
**Team:** [Team members and roles]

## Objectives
1. [Primary objective]
2. [Secondary objective]
3. [Additional objectives]

## Scope
### In Scope
- [Feature/requirement 1]
- [Feature/requirement 2]
- [Feature/requirement 3]

### Out of Scope
- [What's not included]
- [Future considerations]

## Milestones
- [ ] **[Milestone 1]** - [Date]
  - [Deliverable 1]
  - [Deliverable 2]
- [ ] **[Milestone 2]** - [Date]
  - [Deliverable 1]
  - [Deliverable 2]

## Risk Assessment
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to mitigate] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How to mitigate] |

## Success Metrics
- [How you'll measure success]
- [Key performance indicators]

## Resources Needed
- [Tools and software]
- [Personnel]
- [Budget allocations]`,
    aiPrompt: "Help me customize this project planning template for a [PROJECT_TYPE] project in [INDUSTRY/DOMAIN]",
  },
  {
    id: "code-documentation",
    name: "Code Documentation",
    description: "Document code features and APIs",
    category: "Development",
    icon: Code,
    color: "text-purple-600",
    content: `# [Component/Function Name] Documentation

## Overview
Brief description of what this code does and its purpose.

## Installation/Setup
\`\`\`bash
# Installation commands
npm install [package-name]
\`\`\`

## Usage
\`\`\`javascript
// Basic usage example
import { ComponentName } from 'package-name';

const example = new ComponentName({
  option1: 'value1',
  option2: 'value2'
});
\`\`\`

## API Reference

### Methods
#### \`methodName(parameter1, parameter2)\`
- **Description:** What this method does
- **Parameters:**
  - \`parameter1\` (type): Description
  - \`parameter2\` (type): Description
- **Returns:** Return type and description
- **Example:**
  \`\`\`javascript
  const result = methodName('value1', 'value2');
  \`\`\`

### Properties
- \`property1\` (type): Description
- \`property2\` (type): Description

## Examples
### Basic Example
\`\`\`javascript
// Code example with explanation
\`\`\`

### Advanced Example
\`\`\`javascript
// More complex usage
\`\`\`

## Configuration Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | string | 'default' | What this option does |
| option2 | boolean | false | What this option does |

## Troubleshooting
### Common Issues
1. **Issue:** Description of problem
   **Solution:** How to fix it

## Changelog
- **v1.0.0:** Initial release
- **v1.1.0:** Added new features`,
    aiPrompt: "Help me customize this documentation template for [PROGRAMMING_LANGUAGE] [COMPONENT_TYPE]",
  },
  {
    id: "learning-notes",
    name: "Learning Notes",
    description: "Structure for educational content and courses",
    category: "Education",
    icon: BookOpen,
    color: "text-orange-600",
    content: `# Learning Notes - [Topic/Course Name]

**Date Started:** [Date]
**Source:** [Book/Course/Tutorial name]
**Progress:** [X% complete or Chapter X of Y]

## Key Concepts
### [Concept 1]
- **Definition:** [What it is]
- **Why it matters:** [Importance/relevance]
- **Examples:** [Real-world applications]

### [Concept 2]
- **Definition:** [What it is]
- **Why it matters:** [Importance/relevance]
- **Examples:** [Real-world applications]

## Code Examples
\`\`\`javascript
// Example code with comments
function exampleFunction() {
  // Explanation of what this does
  return "example";
}
\`\`\`

## Practice Exercises
- [ ] [Exercise 1 description]
- [ ] [Exercise 2 description]
- [ ] [Exercise 3 description]

## Questions & Confusion
- **Q:** [Question you have]
  **A:** [Answer when you find it]
- **Confused about:** [Topic you're struggling with]
  **Resolution:** [How you figured it out]

## Applications
- [How you can use this in real projects]
- [Ideas for practice projects]

## Related Topics
- [Topic 1] - [Brief description]
- [Topic 2] - [Brief description]

## Next Steps
- [ ] [What to learn next]
- [ ] [Practice project ideas]
- [ ] [Additional resources to explore]

## Resources
- [Link to documentation]
- [Helpful tutorials]
- [Community forums]`,
    aiPrompt: "Help me customize this learning template for studying [SUBJECT/TECHNOLOGY]",
  },
  {
    id: "brainstorm",
    name: "Brainstorming Session",
    description: "Capture and organize creative ideas",
    category: "Creativity",
    icon: Lightbulb,
    color: "text-yellow-600",
    content: `# Brainstorming Session - [Topic/Problem]

**Date:** [Date]
**Participants:** [Who was involved]
**Duration:** [How long]
**Goal:** [What you're trying to solve/create]

## Problem Statement
[Clearly define the challenge or opportunity]

## Initial Ideas
### Idea 1: [Title]
- **Description:** [What is it?]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Feasibility:** [Easy/Medium/Hard]

### Idea 2: [Title]
- **Description:** [What is it?]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Feasibility:** [Easy/Medium/Hard]

### Idea 3: [Title]
- **Description:** [What is it?]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Feasibility:** [Easy/Medium/Hard]

## Wild Ideas
[No judgment zone - capture crazy/unconventional ideas]
- [Wild idea 1]
- [Wild idea 2]
- [Wild idea 3]

## Idea Combinations
- [Idea A] + [Idea B] = [New combined concept]
- [Idea C] + [Idea D] = [New combined concept]

## Evaluation Criteria
- [ ] **Impact:** How much difference will this make?
- [ ] **Feasibility:** How easy is it to implement?
- [ ] **Resources:** What do we need to make it happen?
- [ ] **Timeline:** How long will it take?

## Top Ideas (Ranked)
1. **[Idea name]** - Score: [X/10]
   - Why it's promising: [Reasons]
2. **[Idea name]** - Score: [X/10]
   - Why it's promising: [Reasons]
3. **[Idea name]** - Score: [X/10]
   - Why it's promising: [Reasons]

## Next Actions
- [ ] [Research needed]
- [ ] [Prototyping steps]
- [ ] [People to consult]
- [ ] [Timeline for implementation]

## Follow-up
- **Next brainstorming session:** [Date]
- **Decision deadline:** [Date]
- **Responsible person:** [Name]`,
    aiPrompt: "Help me customize this brainstorming template for [PROBLEM_TYPE] in [CONTEXT/INDUSTRY]",
  },
  {
    id: "task-list",
    name: "Task Management",
    description: "Organize and track tasks efficiently",
    category: "Productivity",
    icon: CheckSquare,
    color: "text-red-600",
    content: `# Task List - [Project/Date]

## Today's Priorities
- [ ] **[High Priority Task 1]** ⚡
  - Estimated time: [X hours]
  - Deadline: [Date]
  - Notes: [Additional context]

- [ ] **[High Priority Task 2]** ⚡
  - Estimated time: [X hours]
  - Deadline: [Date]
  - Notes: [Additional context]

## This Week
### Monday
- [ ] [Task 1]
- [ ] [Task 2]

### Tuesday
- [ ] [Task 1]
- [ ] [Task 2]

### Wednesday
- [ ] [Task 1]
- [ ] [Task 2]

### Thursday
- [ ] [Task 1]
- [ ] [Task 2]

### Friday
- [ ] [Task 1]
- [ ] [Task 2]

## Backlog
- [ ] [Future task 1]
- [ ] [Future task 2]
- [ ] [Future task 3]

## Waiting For
- [ ] [Task waiting on someone else] - Waiting for: [Person/Event]
- [ ] [Task waiting on something] - Waiting for: [Resource/Information]

## Completed ✅
- [x] [Completed task 1] - [Date completed]
- [x] [Completed task 2] - [Date completed]

## Notes & Ideas
- [Random thoughts]
- [Ideas that came up]
- [Things to remember]

## Review
**What went well this week:**
- [Success 1]
- [Success 2]

**What could be improved:**
- [Improvement area 1]
- [Improvement area 2]

**Next week's focus:**
- [Priority 1]
- [Priority 2]`,
    aiPrompt: "Help me customize this task management template for [WORK_TYPE/PROJECT_TYPE]",
  },
];

const categories = [...new Set(templates.map(t => t.category))];

export function SmartTemplates({ isOpen, onClose, onSelectTemplate }: SmartTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customizationPrompt, setCustomizationPrompt] = useState("");

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: Template) => {
    if (template.aiPrompt) {
      setSelectedTemplate(template);
      setIsCustomizing(true);
    } else {
      onSelectTemplate(template);
    }
  };

  const handleCustomizeTemplate = async () => {
    if (!selectedTemplate || !customizationPrompt) return;

    try {
      // Customize template with AI
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'improve',
          content: `${selectedTemplate.aiPrompt}\n\nOriginal template:\n${selectedTemplate.content}\n\nCustomization request: ${customizationPrompt}`,
        }),
      });

      const result = await response.json();
      
      const customizedTemplate = {
        ...selectedTemplate,
        content: result.result,
        name: `${selectedTemplate.name} (Customized)`,
      };

      onSelectTemplate(customizedTemplate);
      setIsCustomizing(false);
      setSelectedTemplate(null);
      setCustomizationPrompt("");
    } catch (error) {
      console.error('Template customization error:', error);
      // Fallback to original template
      onSelectTemplate(selectedTemplate);
      setIsCustomizing(false);
      setSelectedTemplate(null);
      setCustomizationPrompt("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <FileTemplate className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Smart Templates</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isCustomizing ? (
              <>
                {/* Search and Filters */}
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm transition-colors",
                          !selectedCategory
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        All
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm transition-colors",
                            selectedCategory === category
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <motion.button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors text-left group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors")}>
                              <Icon className={cn("h-5 w-5", template.color)} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {template.name}
                                {template.aiPrompt && (
                                  <Sparkles className="inline-block h-4 w-4 ml-1 text-primary" />
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                              <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                                  {template.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-12">
                      <FileTemplate className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No templates found matching your criteria</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Customization Panel */
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Customize "{selectedTemplate?.name}"
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tell me how you'd like to customize this template, and I'll adapt it for your specific needs.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Customization Request
                    </label>
                    <textarea
                      value={customizationPrompt}
                      onChange={(e) => setCustomizationPrompt(e.target.value)}
                      placeholder="e.g., Make this for a software development team meeting about sprint planning"
                      className="w-full p-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCustomizeTemplate}
                      disabled={!customizationPrompt.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Customize with AI
                    </button>
                    <button
                      onClick={() => selectedTemplate && onSelectTemplate(selectedTemplate)}
                      className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      Use Original
                    </button>
                    <button
                      onClick={() => {
                        setIsCustomizing(false);
                        setSelectedTemplate(null);
                        setCustomizationPrompt("");
                      }}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}