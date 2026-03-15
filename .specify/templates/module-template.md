# Module Template

Use this template when creating a new module. Replace `[EntityName]` with your entity name (e.g., `Product`, `Organization`) and `[entity-name]` with kebab-case version (e.g., `product`, `organization`).

## Directory Structure

```
src/modules/[module-name]/
├── domain/
│   └── [entity-name].entity.ts          # Domain types (pure TypeScript)
├── application/
│   ├── [entity-name].repository.ts      # Repository interface
│   ├── [entity-name].service.ts         # Business logic
│   └── types/
│       └── [entity-name].types.ts       # Input/Output types
├── infrastructure/
│   └── [entity-name].repository.impl.ts # Kysely implementation
└── presentation/
    ├── [entity-name].routes.ts          # Elysia routes with Zod
    ├── components/                      # React components
    │   ├── [entity-name]-list-view.tsx
    │   ├── [entity-name]-view.tsx
    │   ├── create-[entity-name]-modal.tsx
    │   ├── edit-[entity-name]-modal.tsx
    │   ├── delete-[entity-name]-alert.tsx
    │   ├── [entities]-trash-list-view.tsx
    │   ├── restore-[entity-name]-alert.tsx
    │   └── permanent-delete-[entity-name]-alert.tsx
    ├── hooks/
    │   ├── use-[entities]-query.ts
    │   ├── use-[entity-name]-query.ts
    │   └── [entity-name]-keys.ts        # Query key factory
    └── schemas/
        └── [entity-name]-schema.ts      # Zod schemas
```

---

## Domain Layer

### [entity-name].entity.ts

Pure TypeScript types with no dependencies.

```typescript
export type EntityName = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
};

export type EntityNameStatus = 'active' | 'archived';
```

**Principles Applied:**
- Principle III (Type Safety): Strict TypeScript with readonly where mutation not expected
- Principle VIII (Soft Delete): deletedAt field for soft delete pattern
- Principle XIV (Multi-Tenancy): organizationId for tenant isolation

---

## Application Layer

### types/[entity-name].types.ts

Explicit Input/Output types for all repository and service operations.

```typescript
import type { EntityName } from '../../domain/[entity-name].entity';

// Repository Input Types
export type CreateEntityNameInput = {
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
};

export type UpdateEntityNameInput = {
  readonly id: string;
  readonly organizationId: string;
  readonly name?: string;
  readonly slug?: string;
  readonly description?: string;
};

export type DeleteEntityNameInput = {
  readonly id: string;
  readonly organizationId: string;
};

export type RestoreEntityNameInput = {
  readonly id: string;
  readonly organizationId: string;
};

export type PermanentDeleteEntityNameInput = {
  readonly id: string;
  readonly organizationId: string;
};

export type GetEntityNameByIdInput = {
  readonly id: string;
  readonly organizationId: string;
};

export type GetEntityNameBySlugInput = {
  readonly slug: string;
  readonly organizationId: string;
};

export type ListEntityNamesInput = {
  readonly organizationId: string;
  readonly search?: string;
  readonly status?: 'active' | 'archived' | 'all';
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: 'name' | 'createdAt' | 'updatedAt';
  readonly sortOrder?: 'asc' | 'desc';
};

// Repository Output Types
export type CreateEntityNameOutput = EntityName;
export type UpdateEntityNameOutput = EntityName;
export type GetEntityNameOutput = EntityName | null;
export type ListEntityNamesOutput = {
  readonly items: readonly EntityName[];
  readonly metadata: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
};

// Service can reuse repository types or define additional ones
export type EntityNameServiceInput = CreateEntityNameInput;
export type EntityNameServiceOutput = EntityName;
```

**Principles Applied:**
- Principle III (Type Safety): Explicit Input/Output types for every operation
- Principle VII (Repository Pattern): Consistent pagination metadata pattern
- Principle VIII (Soft Delete): Restore and permanent delete types included
- Principle XIV (Multi-Tenancy): organizationId in all relevant inputs

---

### [entity-name].repository.ts

Repository interface defining the contract.

```typescript
import type {
  CreateEntityNameInput,
  CreateEntityNameOutput,
  UpdateEntityNameInput,
  UpdateEntityNameOutput,
  DeleteEntityNameInput,
  RestoreEntityNameInput,
  PermanentDeleteEntityNameInput,
  GetEntityNameByIdInput,
  GetEntityNameBySlugInput,
  GetEntityNameOutput,
  ListEntityNamesInput,
  ListEntityNamesOutput,
} from './types/[entity-name].types';

export interface EntityNameRepository {
  create(input: CreateEntityNameInput): Promise<CreateEntityNameOutput>;
  update(input: UpdateEntityNameInput): Promise<UpdateEntityNameOutput>;
  softDelete(input: DeleteEntityNameInput): Promise<void>;
  restore(input: RestoreEntityNameInput): Promise<void>;
  permanentDelete(input: PermanentDeleteEntityNameInput): Promise<void>;
  findById(input: GetEntityNameByIdInput): Promise<GetEntityNameOutput>;
  findBySlug(input: GetEntityNameBySlugInput): Promise<GetEntityNameOutput>;
  list(input: ListEntityNamesInput): Promise<ListEntityNamesOutput>;
  exists(input: { organizationId: string; slug: string }): Promise<boolean>;
}
```

**Principles Applied:**
- Principle VI (Layered Architecture): Interface in Application layer
- Principle VII (Repository Pattern): Explicit contracts with Input/Output types
- Principle VIII (Soft Delete): softDelete, restore, and permanentDelete methods

---

### [entity-name].service.ts

Business logic with dependency injection.

```typescript
import type { EntityNameRepository } from './[entity-name].repository';
import type {
  CreateEntityNameInput,
  CreateEntityNameOutput,
  UpdateEntityNameInput,
  UpdateEntityNameOutput,
  DeleteEntityNameInput,
  RestoreEntityNameInput,
  PermanentDeleteEntityNameInput,
  GetEntityNameByIdInput,
  GetEntityNameOutput,
  ListEntityNamesInput,
  ListEntityNamesOutput,
} from './types/[entity-name].types';

export class EntityNameService {
  constructor(
    private readonly repository: EntityNameRepository,
    // Add other service dependencies here for cross-module orchestration
    // Principle XV: Dependencies injected via constructor
  ) {}

  async create(input: CreateEntityNameInput): Promise<CreateEntityNameOutput> {
    // Business logic: check for duplicates, validate constraints
    const exists = await this.repository.exists({
      organizationId: input.organizationId,
      slug: input.slug,
    });

    if (exists) {
      throw new Error('Entity with this slug already exists');
    }

    return this.repository.create(input);
  }

  async update(input: UpdateEntityNameInput): Promise<UpdateEntityNameOutput> {
    // Verify entity exists and belongs to organization
    const existing = await this.repository.findById({
      id: input.id,
      organizationId: input.organizationId,
    });

    if (!existing) {
      throw new Error('Entity not found');
    }

    // Check slug uniqueness if changing slug
    if (input.slug && input.slug !== existing.slug) {
      const exists = await this.repository.exists({
        organizationId: input.organizationId,
        slug: input.slug,
      });

      if (exists) {
        throw new Error('Entity with this slug already exists');
      }
    }

    return this.repository.update(input);
  }

  async softDelete(input: DeleteEntityNameInput): Promise<void> {
    const existing = await this.repository.findById({
      id: input.id,
      organizationId: input.organizationId,
    });

    if (!existing) {
      throw new Error('Entity not found');
    }

    return this.repository.softDelete(input);
  }

  async restore(input: RestoreEntityNameInput): Promise<void> {
    return this.repository.restore(input);
  }

  async permanentDelete(input: PermanentDeleteEntityNameInput): Promise<void> {
    return this.repository.permanentDelete(input);
  }

  async findById(input: GetEntityNameByIdInput): Promise<GetEntityNameOutput> {
    return this.repository.findById(input);
  }

  async list(input: ListEntityNamesInput): Promise<ListEntityNamesOutput> {
    return this.repository.list(input);
  }
}
```

**Principles Applied:**
- Principle VI (Layered Architecture): Service in Application layer
- Principle VII (Repository Pattern): Depends on repository interface
- Principle VIII (Soft Delete): Business logic for soft delete operations
- Principle XIV (Multi-Tenancy): Validates organization ownership
- Principle XV (Cross-Module Service): Constructor injection for dependencies

---

## Infrastructure Layer

### [entity-name].repository.impl.ts

Kysely implementation with entity mapping.

```typescript
import { uuidv7 } from '@homarr/uuidv7';
import type { Kysely } from 'kysely';
import type { DB } from '@/shared/infrastructure/database/db-types';
import type { EntityName } from '../domain/[entity-name].entity';
import type { EntityNameRepository } from '../application/[entity-name].repository';
import type {
  CreateEntityNameInput,
  CreateEntityNameOutput,
  UpdateEntityNameInput,
  UpdateEntityNameOutput,
  DeleteEntityNameInput,
  RestoreEntityNameInput,
  PermanentDeleteEntityNameInput,
  GetEntityNameByIdInput,
  GetEntityNameBySlugInput,
  GetEntityNameOutput,
  ListEntityNamesInput,
  ListEntityNamesOutput,
} from '../application/types/[entity-name].types';

export class EntityNameRepositoryImpl implements EntityNameRepository {
  constructor(private readonly db: Kysely<DB>) {}

  async create(input: CreateEntityNameInput): Promise<CreateEntityNameOutput> {
    const now = new Date();
    const id = uuidv7();

    const result = await this.db
      .insertInto('entityNames')
      .values({
        id,
        organizationId: input.organizationId,
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async update(input: UpdateEntityNameInput): Promise<UpdateEntityNameOutput> {
    const now = new Date();

    const result = await this.db
      .updateTable('entityNames')
      .set({
        ...(input.name && { name: input.name }),
        ...(input.slug && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        updatedAt: now,
      })
      .where('id', '=', input.id)
      .where('organizationId', '=', input.organizationId)
      .where('deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async softDelete(input: DeleteEntityNameInput): Promise<void> {
    await this.db
      .updateTable('entityNames')
      .set({ deletedAt: new Date() })
      .where('id', '=', input.id)
      .where('organizationId', '=', input.organizationId)
      .where('deletedAt', 'is', null)
      .execute();
  }

  async restore(input: RestoreEntityNameInput): Promise<void> {
    await this.db
      .updateTable('entityNames')
      .set({ deletedAt: null })
      .where('id', '=', input.id)
      .where('organizationId', '=', input.organizationId)
      .where('deletedAt', 'is not', null)
      .execute();
  }

  async permanentDelete(input: PermanentDeleteEntityNameInput): Promise<void> {
    await this.db
      .deleteFrom('entityNames')
      .where('id', '=', input.id)
      .where('organizationId', '=', input.organizationId)
      .execute();
  }

  async findById(input: GetEntityNameByIdInput): Promise<GetEntityNameOutput> {
    const result = await this.db
      .selectFrom('entityNames')
      .selectAll()
      .where('id', '=', input.id)
      .where('organizationId', '=', input.organizationId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findBySlug(input: GetEntityNameBySlugInput): Promise<GetEntityNameOutput> {
    const result = await this.db
      .selectFrom('entityNames')
      .selectAll()
      .where('slug', '=', input.slug)
      .where('organizationId', '=', input.organizationId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async list(input: ListEntityNamesInput): Promise<ListEntityNamesOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = this.db
      .selectFrom('entityNames')
      .selectAll()
      .where('organizationId', '=', input.organizationId);

    // Filter by status
    if (input.status === 'active') {
      query = query.where('deletedAt', 'is', null);
    } else if (input.status === 'archived') {
      query = query.where('deletedAt', 'is not', null);
    }
    // if status === 'all', no filter applied

    // Search
    if (input.search) {
      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', `%${input.search}%`),
          eb('slug', 'ilike', `%${input.search}%`),
        ])
      );
    }

    // Get total count
    const countResult = await query
      .select((eb) => eb.fn.count('id').as('count'))
      .executeTakeFirst();
    const total = Number(countResult?.count ?? 0);

    // Sorting
    const sortBy = input.sortBy ?? 'createdAt';
    const sortOrder = input.sortOrder ?? 'desc';
    query = query.orderBy(sortBy, sortOrder);

    // Pagination
    const items = await query.limit(limit).offset(offset).execute();

    return {
      items: items.map((item) => this.mapToEntity(item)),
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exists(input: { organizationId: string; slug: string }): Promise<boolean> {
    const result = await this.db
      .selectFrom('entityNames')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('slug', '=', input.slug)
      .where('organizationId', '=', input.organizationId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    return Number(result?.count ?? 0) > 0;
  }

  // Private mapping method
  private mapToEntity(dbRow: unknown): EntityName {
    // Type assertion - in production, validate with Zod
    const row = dbRow as {
      id: string;
      organizationId: string;
      name: string;
      slug: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    };

    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      slug: row.slug,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}
```

**Principles Applied:**
- Principle V (Database Migration): Uses Kysely with generated types
- Principle VI (Layered Architecture): Infrastructure layer implementation
- Principle VII (Repository Pattern): Explicit mapping method, consistent pagination
- Principle VIII (Soft Delete): Implements soft delete filtering
- Principle XIV (Multi-Tenancy): organizationId filtering on all queries

---

## Presentation Layer

### schemas/[entity-name]-schema.ts

Zod schemas for validation.

```typescript
import { z } from 'zod';

// Base entity schema
export const entityNameSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Create schema
export const createEntityNameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
});

export type CreateEntityNameSchema = z.infer<typeof createEntityNameSchema>;

// Update schema
export const updateEntityNameSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
});

export type UpdateEntityNameSchema = z.infer<typeof updateEntityNameSchema>;

// List query schema
export const listEntityNamesQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'archived', 'all']).optional().default('active'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListEntityNamesQuerySchema = z.infer<typeof listEntityNamesQuerySchema>;

// ID param schema
export const entityNameIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type EntityNameIdParamSchema = z.infer<typeof entityNameIdParamSchema>;

// Slug param schema
export const entityNameSlugParamSchema = z.object({
  slug: z.string().min(1),
});

export type EntityNameSlugParamSchema = z.infer<typeof entityNameSlugParamSchema>;
```

**Principles Applied:**
- Principle II (API-First): Explicit schemas for all endpoints
- Principle XI (Validation): Zod validation with inline rules
- Principle VIII (Soft Delete): status enum includes 'archived' for trash

---

### [entity-name].routes.ts

Elysia routes with Zod validation.

```typescript
import { Elysia } from 'elysia';
import { EntityNameService } from '../application/[entity-name].service';
import { EntityNameRepositoryImpl } from '../infrastructure/[entity-name].repository.impl';
import {
  createEntityNameSchema,
  updateEntityNameSchema,
  listEntityNamesQuerySchema,
  entityNameIdParamSchema,
} from './schemas/[entity-name]-schema';

// Error response schemas
const notFoundResponse = z.object({
  error: z.literal('Not Found'),
  message: z.string(),
});

const conflictResponse = z.object({
  error: z.literal('Conflict'),
  message: z.string(),
});

const validationErrorResponse = z.object({
  error: z.literal('Validation Error'),
  issues: z.array(z.any()),
});

export const entityNameRoutes = new Elysia({ prefix: '/entity-names' })
  .derive(() => {
    // Dependency injection
    const repository = new EntityNameRepositoryImpl(db);
    const service = new EntityNameService(repository);
    return { service };
  })
  // List entities
  .get(
    '/',
    async ({ query, user }) => {
      const organizationId = user.organizationId;
      return service.list({
        organizationId,
        ...query,
      });
    },
    {
      query: listEntityNamesQuerySchema,
      response: {
        200: z.object({
          items: z.array(entityNameSchema),
          metadata: z.object({
            total: z.number(),
            page: z.number(),
            limit: z.number(),
            totalPages: z.number(),
          }),
        }),
      },
    }
  )
  // Get entity by ID
  .get(
    '/:id',
    async ({ params, user }) => {
      const entity = await service.findById({
        id: params.id,
        organizationId: user.organizationId,
      });

      if (!entity) {
        throw new Error('Entity not found');
      }

      return entity;
    },
    {
      params: entityNameIdParamSchema,
      response: {
        200: entityNameSchema,
        404: notFoundResponse,
      },
    }
  )
  // Create entity
  .post(
    '/',
    async ({ body, user }) => {
      return service.create({
        organizationId: user.organizationId,
        ...body,
      });
    },
    {
      body: createEntityNameSchema,
      response: {
        201: entityNameSchema,
        409: conflictResponse,
        422: validationErrorResponse,
      },
    }
  )
  // Update entity
  .patch(
    '/:id',
    async ({ params, body, user }) => {
      return service.update({
        id: params.id,
        organizationId: user.organizationId,
        ...body,
      });
    },
    {
      params: entityNameIdParamSchema,
      body: updateEntityNameSchema,
      response: {
        200: entityNameSchema,
        404: notFoundResponse,
        409: conflictResponse,
        422: validationErrorResponse,
      },
    }
  )
  // Soft delete entity
  .delete(
    '/:id',
    async ({ params, user }) => {
      await service.softDelete({
        id: params.id,
        organizationId: user.organizationId,
      });
      return { success: true };
    },
    {
      params: entityNameIdParamSchema,
      response: {
        200: z.object({ success: z.boolean() }),
        404: notFoundResponse,
      },
    }
  )
  // Restore entity
  .post(
    '/:id/restore',
    async ({ params, user }) => {
      await service.restore({
        id: params.id,
        organizationId: user.organizationId,
      });
      return { success: true };
    },
    {
      params: entityNameIdParamSchema,
      response: {
        200: z.object({ success: z.boolean() }),
        404: notFoundResponse,
      },
    }
  )
  // Permanent delete entity
  .delete(
    '/:id/permanent',
    async ({ params, user }) => {
      await service.permanentDelete({
        id: params.id,
        organizationId: user.organizationId,
      });
      return { success: true };
    },
    {
      params: entityNameIdParamSchema,
      response: {
        200: z.object({ success: z.boolean() }),
        404: notFoundResponse,
      },
    }
  );
```

**Principles Applied:**
- Principle II (API-First): Explicit response schemas per status code
- Principle VI (Layered Architecture): Presentation layer routes
- Principle VIII (Soft Delete): Restore and permanent delete endpoints
- Principle XIV (Multi-Tenancy): Validates organization access

---

### hooks/[entity-name]-keys.ts

Query key factory for cache management.

```typescript
import type { ListEntityNamesQuerySchema } from '../schemas/[entity-name]-schema';

export const entityNameKeys = {
  // Base key
  all: (organizationId: string) => ['entity-names', organizationId] as const,

  // Lists
  lists: (organizationId: string) =>
    [...entityNameKeys.all(organizationId), 'list'] as const,
  list: (organizationId: string, filters: ListEntityNamesQuerySchema) =>
    [...entityNameKeys.lists(organizationId), filters] as const,

  // Individual entities
  details: (organizationId: string) =>
    [...entityNameKeys.all(organizationId), 'detail'] as const,
  detail: (organizationId: string, id: string) =>
    [...entityNameKeys.details(organizationId), id] as const,

  // Trash
  trash: (organizationId: string) =>
    [...entityNameKeys.all(organizationId), 'trash'] as const,
} as const;
```

**Principles Applied:**
- Principle IX (Query Pattern): Centralized query key factory

---

### hooks/use-[entities]-query.ts

Query hook with optimistic updates.

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/infrastructure/api/client';
import type { ListEntityNamesOutput, EntityName } from '@/modules/[module-name]/domain/[entity-name].entity';
import type { ListEntityNamesQuerySchema } from '../schemas/[entity-name]-schema';
import { entityNameKeys } from './[entity-name]-keys';

// List query hook
export function useEntityNamesQuery(
  organizationId: string,
  filters: ListEntityNamesQuerySchema = {}
) {
  return useQuery({
    queryKey: entityNameKeys.list(organizationId, filters),
    queryFn: async ({ signal }) => {
      const response = await api.entityNames.index.get({
        query: filters,
        fetch: { signal },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch entities');
      }

      return response.data;
    },
    enabled: !!organizationId,
  });
}

// Create mutation with optimistic update
export function useCreateEntityNameMutation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string }) => {
      const response = await api.entityNames.index.post(data);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create entity');
      }

      return response.data;
    },
    // Principle XIII: Optimistic Updates
    onMutate: async (newEntity) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: entityNameKeys.lists(organizationId),
      });

      // Snapshot previous value
      const previousEntities = queryClient.getQueryData<ListEntityNamesOutput>(
        entityNameKeys.list(organizationId, {})
      );

      // Optimistically update
      queryClient.setQueryData<ListEntityNamesOutput>(
        entityNameKeys.list(organizationId, {}),
        (old) => {
          if (!old) return old;

          const optimisticEntity: EntityName = {
            id: 'temp-id',
            organizationId,
            name: newEntity.name,
            slug: newEntity.slug,
            description: newEntity.description ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };

          return {
            ...old,
            items: [optimisticEntity, ...old.items],
            metadata: {
              ...old.metadata,
              total: old.metadata.total + 1,
            },
          };
        }
      );

      // Return context for rollback
      return { previousEntities };
    },
    onError: (err, newEntity, context) => {
      // Rollback on error
      if (context?.previousEntities) {
        queryClient.setQueryData(
          entityNameKeys.list(organizationId, {}),
          context.previousEntities
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: entityNameKeys.lists(organizationId),
      });
    },
  });
}

// Update mutation with optimistic update
export function useUpdateEntityNameMutation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; slug?: string; description?: string };
    }) => {
      const response = await api.entityNames({ id }).patch(data);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update entity');
      }

      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: entityNameKeys.detail(organizationId, id),
      });

      const previousEntity = queryClient.getQueryData<EntityName>(
        entityNameKeys.detail(organizationId, id)
      );

      queryClient.setQueryData<EntityName>(
        entityNameKeys.detail(organizationId, id),
        (old) => {
          if (!old) return old;
          return { ...old, ...data, updatedAt: new Date() };
        }
      );

      return { previousEntity };
    },
    onError: (err, variables, context) => {
      if (context?.previousEntity) {
        queryClient.setQueryData(
          entityNameKeys.detail(organizationId, variables.id),
          context.previousEntity
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: entityNameKeys.detail(organizationId, variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: entityNameKeys.lists(organizationId),
      });
    },
  });
}

// Soft delete mutation with optimistic update
export function useSoftDeleteEntityNameMutation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.entityNames({ id }).delete();

      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete entity');
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: entityNameKeys.lists(organizationId),
      });

      const previousData = queryClient.getQueryData<ListEntityNamesOutput>(
        entityNameKeys.list(organizationId, { status: 'active' })
      );

      queryClient.setQueryData<ListEntityNamesOutput>(
        entityNameKeys.list(organizationId, { status: 'active' }),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
            metadata: {
              ...old.metadata,
              total: old.metadata.total - 1,
            },
          };
        }
      );

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          entityNameKeys.list(organizationId, { status: 'active' }),
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: entityNameKeys.lists(organizationId),
      });
    },
  });
}

// Restore mutation
export function useRestoreEntityNameMutation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.entityNames({ id }).restore.post();

      if (response.error) {
        throw new Error(response.error.message || 'Failed to restore entity');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: entityNameKeys.lists(organizationId),
      });
    },
  });
}

// Permanent delete mutation
export function usePermanentDeleteEntityNameMutation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.entityNames({ id })['permanent'].delete();

      if (response.error) {
        throw new Error(response.error.message || 'Failed to permanently delete entity');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: entityNameKeys.lists(organizationId),
      });
    },
  });
}
```

**Principles Applied:**
- Principle IX (Query Pattern): Signal support for cancellation, query key factories
- Principle XIII (Optimistic Updates): onMutate, onError, onSettled pattern

---

### hooks/use-[entity-name]-query.ts

Single entity query hook.

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/infrastructure/api/client';
import { entityNameKeys } from './[entity-name]-keys';

export function useEntityNameQuery(organizationId: string, id: string | null) {
  return useQuery({
    queryKey: entityNameKeys.detail(organizationId, id ?? ''),
    queryFn: async ({ signal }) => {
      if (!id) throw new Error('Entity ID is required');

      const response = await api.entityNames({ id }).get({
        fetch: { signal },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch entity');
      }

      return response.data;
    },
    enabled: !!organizationId && !!id,
  });
}
```

---

### components/[entity-name]-list-view.tsx

Client view component with loading and error states.

```typescript
'use client';

import { useState } from 'react';
import { useEntityNamesQuery } from '../hooks/use-entity-names-query';
import { CreateEntityNameModal } from './create-entity-name-modal';
import { EditEntityNameModal } from './edit-entity-name-modal';
import { DeleteEntityNameAlert } from './delete-entity-name-alert';
import { EntityNamesTrashListView } from './entity-names-trash-list-view';
import { Skeleton } from '@/shared/presentation/components/ui/skeleton';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/components/ui/table';

interface EntityNameListViewProps {
  organizationId: string;
}

export function EntityNameListView({ organizationId }: EntityNameListViewProps) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'active' | 'trash'>('active');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<string | null>(null);
  const [deleteEntity, setDeleteEntity] = useState<string | null>(null);

  const { data, isLoading, error } = useEntityNamesQuery(organizationId, {
    search: search || undefined,
    status: view === 'trash' ? 'archived' : 'active',
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Failed to load entities: {error.message}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (view === 'trash') {
    return <EntityNamesTrashListView organizationId={organizationId} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex gap-2">
            <Button
              variant={view === 'active' ? 'default' : 'outline'}
              onClick={() => setView('active')}
            >
              Active
            </Button>
            <Button
              variant={view === 'trash' ? 'default' : 'outline'}
              onClick={() => setView('trash')}
            >
              Trash
            </Button>
          </div>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>Create Entity</Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No entities found
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell>{entity.slug}</TableCell>
                  <TableCell>{entity.description || '-'}</TableCell>
                  <TableCell>{entity.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditEntity(entity.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteEntity(entity.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Modals */}
      <CreateEntityNameModal
        organizationId={organizationId}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {editEntity && (
        <EditEntityNameModal
          organizationId={organizationId}
          entityId={editEntity}
          open={!!editEntity}
          onOpenChange={(open) => !open && setEditEntity(null)}
        />
      )}

      {deleteEntity && (
        <DeleteEntityNameAlert
          organizationId={organizationId}
          entityId={deleteEntity}
          open={!!deleteEntity}
          onOpenChange={(open) => !open && setDeleteEntity(null)}
        />
      )}
    </div>
  );
}
```

**Principles Applied:**
- Principle I (Component Architecture): Client view with loading/error states
- Principle VIII (Soft Delete): Trash view with toggle between active/deleted
- Principle XVI (Trash/Restore UI Pattern): Consistent trash list view with restore and permanent delete actions

---

### components/create-[entity-name]-modal.tsx

Create modal with TanStack Form.

```typescript
'use client';

import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useCreateEntityNameMutation } from '../hooks/use-entity-names-query';
import { createEntityNameSchema } from '../schemas/[entity-name]-schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/dialog';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Label } from '@/shared/presentation/components/ui/label';
import { Textarea } from '@/shared/presentation/components/ui/textarea';

interface CreateEntityNameModalProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEntityNameModal({
  organizationId,
  open,
  onOpenChange,
}: CreateEntityNameModalProps) {
  const mutation = useCreateEntityNameMutation(organizationId);

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        name: value.name,
        slug: value.slug,
        description: value.description || undefined,
      });
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Entity</DialogTitle>
          <DialogDescription>
            Add a new entity to your organization.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: createEntityNameSchema.shape.name,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Entity name"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="slug"
            validators={{
              onChange: createEntityNameSchema.shape.slug,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Slug</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="entity-slug"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Principles Applied:**
- Principle X (Form Pattern): TanStack React Form with Zod validation
- Principle XI (Validation): Zod schemas shared between API and forms

---

### components/delete-[entity-name]-alert.tsx

Soft delete confirmation dialog.

**Principles Applied:**
- Principle VIII (Soft Delete): Confirmation explains soft delete with restore option
- Principle XVI (Trash/Restore UI Pattern): Clear messaging about recoverability

```typescript
'use client';

import { useSoftDeleteEntityNameMutation } from '../hooks/use-entity-names-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/presentation/components/ui/alert-dialog';

interface DeleteEntityNameAlertProps {
  organizationId: string;
  entityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEntityNameAlert({
  organizationId,
  entityId,
  open,
  onOpenChange,
}: DeleteEntityNameAlertProps) {
  const mutation = useSoftDeleteEntityNameMutation(organizationId);

  const handleDelete = async () => {
    await mutation.mutateAsync(entityId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Entity</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this entity? It will be moved to trash
            and can be restored later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

### components/[entities]-trash-list-view.tsx

Trash view for deleted entities.

```typescript
'use client';

import { useState } from 'react';
import { useEntityNamesQuery } from '../hooks/use-entity-names-query';
import { useRestoreEntityNameMutation } from '../hooks/use-entity-names-query';
import { usePermanentDeleteEntityNameMutation } from '../hooks/use-entity-names-query';
import { RestoreEntityNameAlert } from './restore-entity-name-alert';
import { PermanentDeleteEntityNameAlert } from './permanent-delete-entity-name-alert';
import { Skeleton } from '@/shared/presentation/components/ui/skeleton';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/components/ui/table';

interface EntityNamesTrashListViewProps {
  organizationId: string;
}

export function EntityNamesTrashListView({
  organizationId,
}: EntityNamesTrashListViewProps) {
  const [search, setSearch] = useState('');
  const [restoreEntity, setRestoreEntity] = useState<string | null>(null);
  const [permanentDeleteEntity, setPermanentDeleteEntity] = useState<string | null>(null);

  const { data, isLoading, error } = useEntityNamesQuery(organizationId, {
    search: search || undefined,
    status: 'archived',
  });

  const restoreMutation = useRestoreEntityNameMutation(organizationId);
  const permanentDeleteMutation = usePermanentDeleteEntityNameMutation(organizationId);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Failed to load trash: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search trash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <p className="text-sm text-muted-foreground">
          Items in trash are automatically deleted after 30 days
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Trash is empty
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell>
                    {entity.deletedAt?.toLocaleDateString() || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRestoreEntity(entity.id)}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setPermanentDeleteEntity(entity.id)}
                    >
                      Delete Forever
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {restoreEntity && (
        <RestoreEntityNameAlert
          organizationId={organizationId}
          entityId={restoreEntity}
          open={!!restoreEntity}
          onOpenChange={(open) => !open && setRestoreEntity(null)}
        />
      )}

      {permanentDeleteEntity && (
        <PermanentDeleteEntityNameAlert
          organizationId={organizationId}
          entityId={permanentDeleteEntity}
          open={!!permanentDeleteEntity}
          onOpenChange={(open) => !open && setPermanentDeleteEntity(null)}
        />
      )}
    </div>
  );
}
```

---

### components/restore-[entity-name]-alert.tsx

Restore confirmation dialog.

**Principles Applied:**
- Principle VIII (Soft Delete): Restore operation returns entity to active state
- Principle XVI (Trash/Restore UI Pattern): Confirmation explains entity will return to active list

```typescript
'use client';

import { useRestoreEntityNameMutation } from '../hooks/use-entity-names-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/presentation/components/ui/alert-dialog';

interface RestoreEntityNameAlertProps {
  organizationId: string;
  entityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestoreEntityNameAlert({
  organizationId,
  entityId,
  open,
  onOpenChange,
}: RestoreEntityNameAlertProps) {
  const mutation = useRestoreEntityNameMutation(organizationId);

  const handleRestore = async () => {
    await mutation.mutateAsync(entityId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Entity</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to restore this entity? It will be moved back to
            the active list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRestore}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Restoring...' : 'Restore'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

### components/permanent-delete-[entity-name]-alert.tsx

Permanent delete confirmation dialog.

**Principles Applied:**
- Principle VIII (Soft Delete): Permanent deletion removes entity entirely
- Principle XVI (Trash/Restore UI Pattern): Clear warning that action cannot be undone

```typescript
'use client';

import { usePermanentDeleteEntityNameMutation } from '../hooks/use-entity-names-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/presentation/components/ui/alert-dialog';

interface PermanentDeleteEntityNameAlertProps {
  organizationId: string;
  entityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PermanentDeleteEntityNameAlert({
  organizationId,
  entityId,
  open,
  onOpenChange,
}: PermanentDeleteEntityNameAlertProps) {
  const mutation = usePermanentDeleteEntityNameMutation(organizationId);

  const handlePermanentDelete = async () => {
    await mutation.mutateAsync(entityId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently Delete Entity</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete this entity? This action
            cannot be undone and the entity will be lost forever.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePermanentDelete}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {mutation.isPending ? 'Deleting...' : 'Delete Forever'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Database Migration

### migrations/[timestamp]_create_[entity_names].ts

```typescript
import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('entity_names')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('organization_id', 'uuid', (col) =>
      col.notNull().references('organizations.id').onDelete('cascade')
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo('now()'))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo('now()'))
    .addColumn('deleted_at', 'timestamptz')
    .addUniqueConstraint('entity_names_organization_slug_unique', [
      'organization_id',
      'slug',
      'deleted_at',
    ])
    .addIndex('entity_names_organization_id_idx').on('organization_id')
    .addIndex('entity_names_slug_idx').on('slug')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('entity_names').execute();
}
```

**Principles Applied:**
- Principle V (Database Migration): uuidv7 primary keys, soft delete, unique constraints with deleted_at
- Principle VIII (Soft Delete): deleted_at field for soft delete pattern
- Principle XIV (Multi-Tenancy): organization_id foreign key and indexes

---

## Integration

### Server Setup

```typescript
// server/index.ts
import { Elysia } from 'elysia';
import { entityNameRoutes } from '@/modules/[module-name]/presentation/[entity-name].routes';

const app = new Elysia()
  .use(entityNameRoutes)
  // ... other routes
  .listen(3000);
```

### API Client

```typescript
// shared/infrastructure/api/client.ts
import { treaty } from '@elysiajs/eden';
import type { App } from '@/server';

export const api = treaty<App>('http://localhost:3000');
```

---

## Testing

### Unit Tests

```typescript
// application/[entity-name].service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { EntityNameService } from './[entity-name].service';
import type { EntityNameRepository } from './[entity-name].repository';

describe('EntityNameService', () => {
  const mockRepository: EntityNameRepository = {
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    permanentDelete: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    list: vi.fn(),
    exists: vi.fn(),
  };

  const service = new EntityNameService(mockRepository);

  describe('create', () => {
    it('should create entity when slug is unique', async () => {
      // Test implementation
    });

    it('should throw error when slug already exists', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

```typescript
// presentation/[entity-name].routes.test.ts
import { describe, it, expect } from 'vitest';
import { Elysia } from 'elysia';
import { entityNameRoutes } from './[entity-name].routes';

describe('EntityNameRoutes', () => {
  const app = new Elysia().use(entityNameRoutes);

  describe('POST /entity-names', () => {
    it('should create entity with valid data', async () => {
      // Test implementation
    });

    it('should return 422 with invalid data', async () => {
      // Test implementation
    });
  });
});
```

---

## Quick Reference

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Files | kebab-case | `entity-name-list-view.tsx` |
| Components | PascalCase | `EntityNameListView` |
| Hooks | camelCase with `use` prefix | `useEntityNamesQuery` |
| Query Keys | camelCase object factory | `entityNameKeys` |
| Types/Interfaces | PascalCase | `EntityName`, `CreateEntityNameInput` |

### Checklist for New Module

- [ ] Domain entity with `organizationId` and `deletedAt` fields
- [ ] Application layer: Repository interface, Service, explicit Input/Output types
- [ ] Infrastructure: Kysely repository implementation with mapping method
- [ ] Presentation: Zod schemas, Elysia routes with response codes
- [ ] Query keys factory
- [ ] React Query hooks with optimistic updates
- [ ] List view component with Skeleton UI and error states
- [ ] Create/Edit modals with TanStack Form
- [ ] Delete/Restore/Permanent delete alerts
- [ ] Database migration with indexes and unique constraints
- [ ] Unit tests for service
- [ ] Integration tests for routes

### Principles Cross-Reference

| Template Section | Principles Applied |
|-----------------|-------------------|
| Domain Layer | III, VIII, XIV |
| Application Types | III, VII, VIII, XIV |
| Repository Interface | VI, VII, VIII |
| Service | VI, VII, VIII, XIV, XV |
| Infrastructure | V, VI, VII, VIII, XIV |
| Schemas | II, VIII, XI |
| Routes | II, VI, VIII, XIV |
| Query Keys | IX |
| Query Hooks | IX, XIII |
| List View | I, VIII, XVI |
| Trash List View | I, VIII, XVI |
| Create Modal | X, XI |
| Delete Alert | VIII, XVI |
| Restore Alert | VIII, XVI |
| Permanent Delete Alert | VIII, XVI |
| Database Migration | V, VIII, XIV |
