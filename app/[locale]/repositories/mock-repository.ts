export interface DemoRepository<T, TInput = unknown> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: TInput): Promise<T>;
}

export type MockRepository<T extends { id: string }, TInput> = DemoRepository<T, TInput> & {
  getSnapshot(): readonly T[];
  subscribe(listener: () => void): () => void;
};

type MockRepositoryConfig<T extends { id: string }, TInput> = {
  create: (input: TInput, sequence: number) => T;
  seed: readonly T[];
  storageKey?: string;
  update: (current: T, input: TInput) => T;
};

export function createMockRepository<T extends { id: string }, TInput>({
  create,
  seed,
  storageKey,
  update,
}: MockRepositoryConfig<T, TInput>): MockRepository<T, TInput> {
  let items = [...seed];
  let storageHydrated = false;
  const listeners = new Set<() => void>();

  function hydrateFromStorage() {
    if (storageHydrated || !storageKey || typeof window === "undefined") return;

    storageHydrated = true;
    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) return;

    try {
      const storedItems: unknown = JSON.parse(storedValue);
      if (Array.isArray(storedItems)) items = storedItems as T[];
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }

  function persistToStorage() {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    async list() {
      hydrateFromStorage();
      return [...items];
    },
    async get(id) {
      hydrateFromStorage();
      return items.find((item) => item.id === id) ?? null;
    },
    async create(input) {
      hydrateFromStorage();
      const item = create(input, items.length + 1);
      items = [...items, item];
      persistToStorage();
      notify();
      return item;
    },
    async update(id, input) {
      hydrateFromStorage();
      const current = items.find((item) => item.id === id);
      if (!current) throw new Error(`Mock repository item not found: ${id}`);

      const updated = update(current, input);
      items = items.map((item) => (item.id === id ? updated : item));
      persistToStorage();
      notify();
      return updated;
    },
    getSnapshot() {
      hydrateFromStorage();
      return items;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
