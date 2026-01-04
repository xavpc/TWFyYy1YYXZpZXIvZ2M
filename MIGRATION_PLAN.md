# TypeORM to Prisma NestJS Migration Checklist

## 🚨 CRITICAL INSTRUCTIONS FOR CLAUDE CODE

### Working Directory Rules
```
⛔ NEVER MODIFY: /api (original TypeORM code)
✅ ONLY WORK IN: /api-prisma (Prisma migration copy)
```

**IMPORTANT:**
- **ALL changes must be made ONLY in `/api-prisma` folder**
- **NEVER touch, modify, or delete anything in `/api` folder**
- The `/api` folder contains the original TypeORM implementation and must remain untouched
- The `/api-prisma` folder is where all Prisma migration work happens
- After EVERY change, STOP and wait for user to review and commit
- User will create git commits after each step for full commit history
- Do not proceed to next step until user explicitly asks to continue

### Git Commit Strategy
After each checkbox item is completed:
1. ⏸️ **STOP** - Do not continue automatically
2. 👀 User reviews the changes
3. 💾 User creates a git commit with descriptive message
4. ✅ User explicitly requests to continue to next step

---

## Phase 0: Initial Setup

### 0.1 Create Prisma Project Copy (DONE ALREADY PLEASE SKIP!!)
- [ ] Copy entire `/api` folder to `/api-prisma`
- [ ] Verify `/api-prisma` is a complete copy

### 0.2 Project Analysis (Read Only)
- [ ] Document all existing TypeORM entities in `/api` (READ ONLY)
- [ ] List all custom repositories and their methods
- [ ] Identify all decorators used (@Column, @ManyToOne, @OneToMany, etc.)
- [ ] Document existing migrations and their history
- [ ] Note any TypeORM-specific features (subscribers, listeners, custom types)
- [ ] Identify database triggers, views, or stored procedures
- [ ] **⏸️ STOP** - Commit: "docs: document TypeORM structure for migration"

### 0.3 Backup and Safety
- [ ] Create a full database backup (manual step)
- [ ] Ensure all changes are committed to version control
- [ ] Create a new migration branch
- [ ] Document current database schema
- [ ] **⏸️ STOP** - Commit: "docs: add database schema documentation"

---

## Phase 1: Prisma Installation (in /api-prisma only)

### 1.1 Install Prisma Packages
```bash
cd api-prisma
npm install prisma @prisma/client
npm install -D prisma
```
- [ ] Install Prisma and Prisma Client in `/api-prisma/package.json`
- [ ] **⏸️ STOP** - Commit: "build: install Prisma packages in api-prisma"

### 1.2 Initialize Prisma
```bash
cd api-prisma
npx prisma init
```
- [ ] Initialize Prisma in `/api-prisma` project
- [ ] Configure `/api-prisma/.env` with DATABASE_URL (use different DB or schema)
- [ ] Update `/api-prisma/.gitignore` to include `prisma/` (except schema.prisma)
- [ ] **⏸️ STOP** - Commit: "chore: initialize Prisma in api-prisma"

---

## Phase 2: Schema Migration (in /api-prisma only)

### 2.1 Generate Initial Schema
```bash
cd api-prisma
npx prisma db pull
```
- [ ] Run `npx prisma db pull` to introspect existing database
- [ ] Review generated `/api-prisma/prisma/schema.prisma` file
- [ ] **⏸️ STOP** - Commit: "feat: generate initial Prisma schema from database"

### 2.2 Schema Formatting
- [ ] Adjust schema formatting and naming conventions in `/api-prisma/prisma/schema.prisma`
- [ ] Add missing constraints or indexes
- [ ] **⏸️ STOP** - Commit: "refactor: format Prisma schema"

### 2.3 Enum Types
- [ ] Convert TypeORM enum types to Prisma enums in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "feat: add enums to Prisma schema"

### 2.4 Custom Column Types
- [ ] Map custom column types to Prisma types in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "feat: map custom types in Prisma schema"

### 2.5 Relations Configuration
- [ ] Configure relation names and fields explicitly in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "feat: configure explicit relations in Prisma schema"

### 2.6 Table and Column Mappings
- [ ] Add `@@map()` and `@map()` for table/column name mappings in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "feat: add table and column mappings to Prisma schema"

### 2.7 Indexes and Constraints
- [ ] Set up composite indexes with `@@index()` in `/api-prisma/prisma/schema.prisma`
- [ ] Configure `@@unique()` constraints
- [ ] **⏸️ STOP** - Commit: "feat: add indexes and unique constraints to Prisma schema"

### 2.8 Default Values and Timestamps
- [ ] Add `@default()` values where needed in `/api-prisma/prisma/schema.prisma`
- [ ] Set up `@updatedAt` for timestamp fields
- [ ] **⏸️ STOP** - Commit: "feat: configure defaults and timestamps in Prisma schema"

### 2.9 Cascade Rules
- [ ] Set up `onDelete` and `onUpdate` cascade rules in `/api-prisma/prisma/schema.prisma`
- [ ] Configure optional vs required relations
- [ ] **⏸️ STOP** - Commit: "feat: configure cascade rules in Prisma schema"

---

## Phase 3: Core Module Setup (in /api-prisma only)

### 3.1 Create PrismaModule
- [ ] Create `/api-prisma/src/prisma/prisma.module.ts`
- [ ] Make it a global module with `@Global()` decorator
- [ ] **⏸️ STOP** - Commit: "feat: create PrismaModule"

### 3.2 Create PrismaService
- [ ] Create `/api-prisma/src/prisma/prisma.service.ts`
- [ ] Extend PrismaClient
- [ ] Implement `onModuleInit()` and `onModuleDestroy()`
- [ ] **⏸️ STOP** - Commit: "feat: create PrismaService"

### 3.3 Update AppModule
- [ ] Import PrismaModule in `/api-prisma/src/app.module.ts`
- [ ] Keep TypeORM configuration for now (will remove later)
- [ ] **⏸️ STOP** - Commit: "feat: import PrismaModule in AppModule"

---

## Phase 4: Entity Conversion (in /api-prisma only)

**Note:** Convert entities one at a time, stopping after each

### 4.1 First Entity Conversion
- [ ] Choose one simple entity to start with
- [ ] Create TypeScript interface or type in `/api-prisma/src/[module]/entities/`
- [ ] Or plan to use Prisma generated types directly
- [ ] **⏸️ STOP** - Commit: "refactor: convert [EntityName] to Prisma type"

### 4.2 Remaining Entities
- [ ] Convert next entity (repeat for each entity, one at a time)
- [ ] **⏸️ STOP** - Commit: "refactor: convert [EntityName] to Prisma type"
- [ ] Continue until all entities are converted

---

## Phase 5: Service/Repository Migration (in /api-prisma only)

**Note:** Migrate services one at a time, stopping after each

### 5.1 First Service Migration
- [ ] Choose one service in `/api-prisma/src/[module]/`
- [ ] Inject `PrismaService` instead of TypeORM repository
- [ ] **⏸️ STOP** - Commit: "refactor: inject PrismaService in [ServiceName]"

### 5.2 Convert Find Methods
- [ ] Convert `find()` to `prisma.model.findMany()` in the service
- [ ] Convert `findOne()` to `prisma.model.findUnique()` or `findFirst()`
- [ ] **⏸️ STOP** - Commit: "refactor: convert find methods to Prisma in [ServiceName]"

### 5.3 Convert Create/Update Methods
- [ ] Convert `save()` to `prisma.model.create()` or `update()`
- [ ] Convert `update()` to `prisma.model.update()`
- [ ] **⏸️ STOP** - Commit: "refactor: convert create/update methods to Prisma in [ServiceName]"

### 5.4 Convert Delete Methods
- [ ] Convert `delete()` to `prisma.model.delete()`
- [ ] Convert `count()` to `prisma.model.count()`
- [ ] **⏸️ STOP** - Commit: "refactor: convert delete/count methods to Prisma in [ServiceName]"

### 5.5 Convert Query Builder
- [ ] Migrate custom query builder queries to Prisma queries
- [ ] Convert raw SQL queries to Prisma raw queries or typed queries
- [ ] **⏸️ STOP** - Commit: "refactor: convert query builder to Prisma in [ServiceName]"

### 5.6 Repeat for Next Service
- [ ] Move to next service and repeat steps 5.1-5.5
- [ ] **⏸️ STOP** after each service
- [ ] Continue until all services are migrated

---

## Phase 6: Query Pattern Conversions (in /api-prisma only)

### 6.1 FindOptions to Prisma
- [ ] Convert `where` → `where` across all services in `/api-prisma/src/`
- [ ] **⏸️ STOP** - Commit: "refactor: convert where clauses to Prisma"

- [ ] Convert `select` → `select`
- [ ] **⏸️ STOP** - Commit: "refactor: convert select clauses to Prisma"

- [ ] Convert `relations` → `include`
- [ ] **⏸️ STOP** - Commit: "refactor: convert relations to include in Prisma"

- [ ] Convert `order` → `orderBy`
- [ ] **⏸️ STOP** - Commit: "refactor: convert order to orderBy in Prisma"

- [ ] Convert `skip`/`take` → `skip`/`take`
- [ ] **⏸️ STOP** - Commit: "refactor: convert pagination to Prisma"

### 6.2 QueryBuilder Conversions
- [ ] Convert `leftJoin()`/`innerJoin()` → `include` with relations
- [ ] **⏸️ STOP** - Commit: "refactor: convert joins to Prisma includes"

- [ ] Convert `andWhere()`/`orWhere()` → nested `where` conditions
- [ ] **⏸️ STOP** - Commit: "refactor: convert where conditions to Prisma"

- [ ] Convert `groupBy()` → `groupBy` with aggregations
- [ ] Convert `having()` → combine with `groupBy`
- [ ] **⏸️ STOP** - Commit: "refactor: convert aggregations to Prisma"

---

## Phase 7: Transaction Handling (in /api-prisma only)

### 7.1 Convert Transactions
- [ ] Find all TypeORM transactions in `/api-prisma/src/`
- [ ] Convert first transaction to `prisma.$transaction()`
- [ ] **⏸️ STOP** - Commit: "refactor: convert [method] transaction to Prisma"

- [ ] Convert remaining transactions one at a time
- [ ] **⏸️ STOP** after each
- [ ] Continue until all transactions are converted

---

## Phase 8: Advanced Features (in /api-prisma only)

### 8.1 Soft Deletes
- [ ] Add `deletedAt` field to schema if needed in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "feat: add soft delete field to schema"

- [ ] Implement soft delete middleware in `/api-prisma/src/prisma/prisma.service.ts`
- [ ] **⏸️ STOP** - Commit: "feat: implement soft delete middleware"

- [ ] Update queries to filter out soft-deleted records
- [ ] **⏸️ STOP** - Commit: "refactor: add soft delete filters to queries"

### 8.2 Lifecycle Hooks
- [ ] Convert first TypeORM subscriber to Prisma middleware in `/api-prisma/src/`
- [ ] **⏸️ STOP** - Commit: "refactor: convert [subscriber] to Prisma middleware"

- [ ] Continue with remaining subscribers/hooks
- [ ] **⏸️ STOP** after each

### 8.3 Validation Migration
- [ ] Move validation from entities to DTOs in `/api-prisma/src/[module]/dto/`
- [ ] **⏸️ STOP** - Commit: "refactor: move validation to DTOs"

### 8.4 Seeding
- [ ] Create `/api-prisma/prisma/seed.ts` file
- [ ] **⏸️ STOP** - Commit: "feat: create Prisma seed file"

- [ ] Migrate TypeORM fixtures to Prisma seed script
- [ ] **⏸️ STOP** - Commit: "feat: implement database seeding"

- [ ] Add seed script to `/api-prisma/package.json`
- [ ] **⏸️ STOP** - Commit: "chore: add seed script to package.json"

---

## Phase 9: Remove TypeORM (in /api-prisma only)

### 9.1 Remove TypeORM from Modules
- [ ] Remove `TypeOrmModule.forRoot()` from `/api-prisma/src/app.module.ts`
- [ ] **⏸️ STOP** - Commit: "refactor: remove TypeORM root module"

- [ ] Remove `TypeOrmModule.forFeature()` from first feature module
- [ ] **⏸️ STOP** - Commit: "refactor: remove TypeORM from [module-name]"

- [ ] Continue with remaining modules
- [ ] **⏸️ STOP** after each

### 9.2 Remove TypeORM Imports
- [ ] Remove TypeORM imports from first file
- [ ] **⏸️ STOP** - Commit: "refactor: remove TypeORM imports from [file-name]"

- [ ] Continue until all TypeORM imports are removed

### 9.3 Remove TypeORM Entities
- [ ] Delete or archive TypeORM entity files in `/api-prisma/src/[module]/entities/`
- [ ] **⏸️ STOP** - Commit: "refactor: remove TypeORM entity files"

### 9.4 Uninstall TypeORM
```bash
cd api-prisma
npm uninstall typeorm @nestjs/typeorm
```
- [ ] Uninstall TypeORM packages from `/api-prisma/package.json`
- [ ] **⏸️ STOP** - Commit: "build: remove TypeORM dependencies"

---

## Phase 10: Optimization (in /api-prisma only)

### 10.1 Performance - Indexes
- [ ] Add database indexes to schema in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "perf: add database indexes"

### 10.2 Performance - Query Optimization
- [ ] Optimize first N+1 query with proper `include`
- [ ] **⏸️ STOP** - Commit: "perf: optimize [query-name] with includes"

- [ ] Continue with remaining N+1 queries

### 10.3 Connection Pool
- [ ] Configure connection pool settings in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "config: configure Prisma connection pool"

### 10.4 Error Handling
- [ ] Create Prisma exception filter in `/api-prisma/src/common/filters/`
- [ ] **⏸️ STOP** - Commit: "feat: create Prisma exception filter"

- [ ] Apply exception filter globally in `/api-prisma/src/main.ts`
- [ ] **⏸️ STOP** - Commit: "feat: apply Prisma exception filter globally"

---

## Phase 11: Documentation (in /api-prisma only)

### 11.1 Update README
- [ ] Update `/api-prisma/README.md` with Prisma setup instructions
- [ ] **⏸️ STOP** - Commit: "docs: update README with Prisma instructions"

### 11.2 Schema Documentation
- [ ] Add `///` comments to schema in `/api-prisma/prisma/schema.prisma`
- [ ] **⏸️ STOP** - Commit: "docs: add schema documentation"

### 11.3 Code Comments
- [ ] Add JSDoc comments to complex queries in services
- [ ] **⏸️ STOP** - Commit: "docs: add JSDoc comments to complex queries"

---

## Common Conversion Patterns Reference

### TypeORM → Prisma Query Examples

```typescript
// Find all
// TypeORM (/api)
await repo.find({ where: { status: 'active' } });
// Prisma (/api-prisma)
await prisma.model.findMany({ where: { status: 'active' } });

// Find one
// TypeORM (/api)
await repo.findOne({ where: { id } });
// Prisma (/api-prisma)
await prisma.model.findUnique({ where: { id } });

// Create
// TypeORM (/api)
await repo.save({ name: 'John' });
// Prisma (/api-prisma)
await prisma.model.create({ data: { name: 'John' } });

// Update
// TypeORM (/api)
await repo.update({ id }, { name: 'Jane' });
// Prisma (/api-prisma)
await prisma.model.update({ where: { id }, data: { name: 'Jane' } });

// Delete
// TypeORM (/api)
await repo.delete({ id });
// Prisma (/api-prisma)
await prisma.model.delete({ where: { id } });

// Relations
// TypeORM (/api)
await repo.find({ relations: ['posts', 'profile'] });
// Prisma (/api-prisma)
await prisma.user.findMany({ include: { posts: true, profile: true } });
```

---

## Final Reminders

### ⛔ DO NOT:
- Modify, delete, or touch ANYTHING in `/api` folder
- Continue to next step without user approval
- Make multiple changes without stopping for commit
- Assume the user wants to proceed automatically

### ✅ DO:
- Work ONLY in `/api-prisma` folder
- STOP after every checkbox item completion
- Wait for explicit user instruction to continue
- Create clear, atomic changes for each commit
- Keep `/api` folder completely pristine as reference

### 📝 Git Commit Messages Format:
- `feat:` - New features
- `refactor:` - Code restructuring
- `test:` - Test updates
- `docs:` - Documentation
- `build:` - Dependencies
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

---

## Migration Complete ✅

Once all phases are complete:
- `/api` - Original TypeORM implementation (untouched)
- `/api-prisma` - New Prisma implementation (fully migrated)
- Both can run side-by-side during transition period
- Full git history of migration process preserved