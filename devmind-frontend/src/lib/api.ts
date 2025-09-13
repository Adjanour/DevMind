const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Note {
  id: number;
  title: string;
  content: string;
  contentType: "markdown" | "richtext" | "code";
  tags: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Timeline {
  id: number;
  title: string;
  description: string;
  milestones: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Notes API
  async getNotes(params?: {
    search?: string;
    tag?: string;
    pinned?: boolean;
    archived?: boolean;
  }): Promise<Note[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.pinned) searchParams.set("pinned", "true");
    if (params?.archived) searchParams.set("archived", "true");

    const query = searchParams.toString();
    return this.request<Note[]>(`/notes${query ? `?${query}` : ""}`);
  }

  async createNote(note: Partial<Note>): Promise<Note> {
    return this.request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: number, note: Partial<Note>): Promise<Note> {
    return this.request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id: number): Promise<void> {
    return this.request<void>(`/notes/${id}`, {
      method: "DELETE",
    });
  }

  // Tags API
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>("/tags");
  }

  async createTag(tag: Partial<Tag>): Promise<Tag> {
    return this.request<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify(tag),
    });
  }

  // Timelines API
  async getTimelines(): Promise<Timeline[]> {
    return this.request<Timeline[]>("/timelines");
  }

  async createTimeline(timeline: Partial<Timeline>): Promise<Timeline> {
    return this.request<Timeline>("/timelines", {
      method: "POST",
      body: JSON.stringify(timeline),
    });
  }

  async updateTimeline(id: number, timeline: Partial<Timeline>): Promise<Timeline> {
    return this.request<Timeline>(`/timelines/${id}`, {
      method: "PUT",
      body: JSON.stringify(timeline),
    });
  }
}

export const api = new ApiClient();