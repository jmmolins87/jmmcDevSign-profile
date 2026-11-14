import {
  isPostDraft,
  type CreatePostInput,
  type PostDraft,
  type UpdatePostInput,
} from "@/app/es/blog/domain";

export const POST_STORAGE_KEY = "jmmc-posts-v1";

export interface PostRepository {
  list(): Promise<PostDraft[]>;
  get(id: string): Promise<PostDraft | null>;
  getBySlug(slug: string): Promise<PostDraft | null>;
  create(input: CreatePostInput): Promise<PostDraft>;
  update(id: string, input: UpdatePostInput): Promise<PostDraft>;
  remove(id: string): Promise<void>;
}

export type PostPersistenceMode = "localStorage" | "memory";

export type PostPersistenceState = {
  mode: PostPersistenceMode;
  message?: string;
};

export type ClientPostRepository = PostRepository & {
  getSnapshot(): readonly PostDraft[];
  subscribe(listener: () => void): () => void;
  getPersistenceState(): PostPersistenceState;
};

type ClientPostRepositoryConfig = {
  seed: readonly PostDraft[];
  now?: () => string;
  storageKey?: string;
};

function clonePost(post: PostDraft): PostDraft {
  return { ...post, tags: [...post.tags] };
}

function clonePosts(posts: readonly PostDraft[]): PostDraft[] {
  return posts.map(clonePost);
}

export function createClientPostRepository({
  seed,
  now = () => new Date().toISOString(),
  storageKey = POST_STORAGE_KEY,
}: ClientPostRepositoryConfig): ClientPostRepository {
  const safeSeed = clonePosts(seed);
  let items = clonePosts(safeSeed);
  let hydrated = false;
  let persistenceState: PostPersistenceState = { mode: "localStorage" };
  const listeners = new Set<() => void>();

  function setMemoryFallback(message: string) {
    persistenceState = { mode: "memory", message };
  }

  function persist() {
    if (typeof window === "undefined") {
      setMemoryFallback("El almacenamiento del navegador no está disponible; se usa memoria.");
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
      persistenceState = { mode: "localStorage" };
    } catch (error) {
      setMemoryFallback("No se pudo persistir en localStorage; los cambios siguen en memoria.");
      console.warn("[post-repository] localStorage persistence failed", error);
    }
  }

  function hydrate() {
    if (hydrated) return;
    hydrated = true;

    if (typeof window === "undefined") {
      setMemoryFallback("El almacenamiento del navegador no está disponible; se usa memoria.");
      return;
    }

    let storedValue: string | null;
    try {
      storedValue = window.localStorage.getItem(storageKey);
    } catch (error) {
      setMemoryFallback("No se pudo leer localStorage; se usan los fixtures en memoria.");
      console.warn("[post-repository] localStorage read failed", error);
      return;
    }

    if (!storedValue) return;

    try {
      const parsed: unknown = JSON.parse(storedValue);
      if (!Array.isArray(parsed) || !parsed.every(isPostDraft)) {
        items = clonePosts(safeSeed);
        const recoveryMessage = "El snapshot no era válido; se restauraron los fixtures seguros.";
        persistenceState = { mode: "localStorage", message: recoveryMessage };
        persist();
        if (persistenceState.mode === "localStorage") {
          persistenceState = { mode: "localStorage", message: recoveryMessage };
        }
        return;
      }

      items = clonePosts(parsed);
    } catch (error) {
      items = clonePosts(safeSeed);
      setMemoryFallback("El snapshot estaba corrupto; se restauraron los fixtures en memoria.");
      console.warn("[post-repository] invalid localStorage snapshot", error);
    }
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    async list() {
      hydrate();
      return clonePosts(items);
    },
    async get(id) {
      hydrate();
      const post = items.find((candidate) => candidate.id === id);
      return post ? clonePost(post) : null;
    },
    async getBySlug(slug) {
      hydrate();
      const post = items.find((candidate) => candidate.slug === slug);
      return post ? clonePost(post) : null;
    },
    async create(input) {
      hydrate();
      const timestamp = now();
      const post: PostDraft = {
        ...input,
        id: `post-${items.length + 1}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      items = [...items, post];
      persist();
      notify();
      return clonePost(post);
    },
    async update(id, input) {
      hydrate();
      const current = items.find((candidate) => candidate.id === id);
      if (!current) throw new Error(`Post not found: ${id}`);

      const updated: PostDraft = {
        ...current,
        ...input,
        id: current.id,
        updatedAt: now(),
      };
      items = items.map((candidate) => (candidate.id === id ? updated : candidate));
      persist();
      notify();
      return clonePost(updated);
    },
    async remove(id) {
      hydrate();
      if (!items.some((candidate) => candidate.id === id)) throw new Error(`Post not found: ${id}`);

      items = items.filter((candidate) => candidate.id !== id);
      persist();
      notify();
    },
    getSnapshot() {
      hydrate();
      return items;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getPersistenceState() {
      hydrate();
      return persistenceState;
    },
  };
}
