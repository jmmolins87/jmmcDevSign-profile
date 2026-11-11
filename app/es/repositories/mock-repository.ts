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
  update: (current: T, input: TInput) => T;
};

export function createMockRepository<T extends { id: string }, TInput>({
  create,
  seed,
  update,
}: MockRepositoryConfig<T, TInput>): MockRepository<T, TInput> {
  let items = [...seed];
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    async list() {
      return [...items];
    },
    async get(id) {
      return items.find((item) => item.id === id) ?? null;
    },
    async create(input) {
      const item = create(input, items.length + 1);
      items = [...items, item];
      notify();
      return item;
    },
    async update(id, input) {
      const current = items.find((item) => item.id === id);
      if (!current) throw new Error(`Mock repository item not found: ${id}`);

      const updated = update(current, input);
      items = items.map((item) => (item.id === id ? updated : item));
      notify();
      return updated;
    },
    getSnapshot() {
      return items;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
