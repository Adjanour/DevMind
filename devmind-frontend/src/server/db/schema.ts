// DevMind database schema
import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * Multi-project schema for DevMind
 */
export const createTable = pgTableCreator((name) => `devmind_${name}`);

export const notes = createTable(
  "note",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    content: text("content").notNull(),
    contentType: varchar("content_type", { length: 50 }).default("markdown").notNull(), // markdown, richtext, code
    tags: jsonb("tags").$type<string[]>().default([]),
    isPinned: boolean("is_pinned").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (note) => ({
    titleIndex: index("title_idx").on(note.title),
    tagsIndex: index("tags_idx").on(note.tags),
    createdAtIndex: index("created_at_idx").on(note.createdAt),
  })
);

export const mindMaps = createTable(
  "mind_map",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    data: jsonb("data").notNull(), // Mind map nodes and connections
    noteId: serial("note_id").references(() => notes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (mindMap) => ({
    titleIndex: index("mindmap_title_idx").on(mindMap.title),
    noteIdIndex: index("mindmap_note_id_idx").on(mindMap.noteId),
  })
);

export const timelines = createTable(
  "timeline",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    milestones: jsonb("milestones").$type<Array<{
      id: string;
      title: string;
      description?: string;
      date: string;
      completed: boolean;
    }>>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (timeline) => ({
    titleIndex: index("timeline_title_idx").on(timeline.title),
  })
);

export const tags = createTable(
  "tag",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    color: varchar("color", { length: 7 }).default("#3b82f6"), // hex color
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (tag) => ({
    nameIndex: index("tag_name_idx").on(tag.name),
  })
);
