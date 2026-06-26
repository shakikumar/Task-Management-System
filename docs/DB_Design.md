# Database Design Document

## Database Overview
The Task Management System utilizes a **PostgreSQL** relational database. The schema is managed using **Prisma ORM**, which provides type safety and automated migrations.

## Normalization
The database follows **Third Normal Form (3NF)**:
1. **1NF**: Each column contains atomic values, and each record has a unique primary key (`id` fields using UUIDs).
2. **2NF**: All non-key attributes are fully functional dependent on the primary key.
3. **3NF**: There are no transitive dependencies. For example, a `Comment` relies on `taskId`, and `Task` relies on `projectId`. We do not duplicate project information inside a comment.

## Tables & Columns

### 1. User
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID | Unique identifier |
| `name` | String | Not Null | User's full name |
| `email` | String | Not Null, Unique | User's email address |
| `password` | String | Not Null | Hashed password |
| `role` | Enum (`Role`) | Default: `COLLABORATOR` | Role-Based Access Control |
| `mustResetPassword` | Boolean | Default: `true` | Forces reset on first login |
| `isActive` | Boolean | Default: `true` | Soft-deactivation flag |
| `createdAt` | DateTime | Default: `now()` | Timestamp |
| `updatedAt` | DateTime | Updated automatically | Timestamp |

### 2. Project
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID | Unique identifier |
| `name` | String | Not Null | Project name |
| `description` | String | Nullable | Optional detailed description |
| `status` | Enum (`ProjectStatus`) | Default: `PLANNING` | Current project state |
| `createdById` | String | Foreign Key | References `User.id` |
| `createdAt` | DateTime | Default: `now()` | Timestamp |
| `updatedAt` | DateTime | Updated automatically | Timestamp |

### 3. Task
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID | Unique identifier |
| `title` | String | Not Null | Task title |
| `description` | String | Nullable | Optional detailed description |
| `status` | Enum (`TaskStatus`) | Default: `TODO` | Task progress |
| `priority` | Enum (`Priority`) | Default: `MEDIUM` | Importance level |
| `dueDate` | DateTime | Nullable | Target completion date |
| `projectId` | String | Foreign Key | References `Project.id` |
| `assignedUserId` | String | Foreign Key | References `User.id` |
| `createdAt` | DateTime | Default: `now()` | Timestamp |
| `updatedAt` | DateTime | Updated automatically | Timestamp |

**Indexes**:
- `@@index([projectId])`
- `@@index([assignedUserId])`

### 4. Comment (Task Comments)
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID | Unique identifier |
| `content` | String | Not Null | The comment text |
| `taskId` | String | Foreign Key | References `Task.id` |
| `userId` | String | Foreign Key | References `User.id` |
| `createdAt` | DateTime | Default: `now()` | Timestamp |

### 5. ProjectComment
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID | Unique identifier |
| `content` | String | Not Null | The comment text |
| `projectId` | String | Foreign Key | References `Project.id` |
| `userId` | String | Foreign Key | References `User.id` |
| `createdAt` | DateTime | Default: `now()` | Timestamp |

### 6. Attachment
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID | Unique identifier |
| `fileName` | String | Not Null | Original name of the uploaded file |
| `fileUrl` | String | Not Null | Storage URL (e.g., Supabase bucket path) |
| `taskId` | String | Foreign Key | References `Task.id` |
| `userId` | String | Foreign Key | References `User.id` |
| `createdAt` | DateTime | Default: `now()` | Timestamp |

### 7. Notification
| Column Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID | Unique identifier |
| `message` | String | Not Null | Notification text |
| `isRead` | Boolean | Default: `false` | Read receipt flag |
| `userId` | String | Foreign Key | References `User.id` |
| `reminderType` | String | Nullable | Specific type for automated reminders |
| `createdAt` | DateTime | Default: `now()` | Timestamp |

**Indexes**:
- `@@index([userId])`

## Relationships & Constraints

### Cascading Deletes
The schema uses `onDelete: Cascade` strategically to maintain referential integrity without leaving orphaned rows:
- **Task Deletion**: Deleting a `Project` cascades and deletes all associated `Tasks`.
- **User Deletion**: Deleting a `User` cascades and removes tasks assigned to them.
- **Task Metadata**: Deleting a `Task` cascades and deletes all associated `Comments` and `Attachments`.
- **Notification Deletion**: Deleting a `User` cascades and deletes their `Notifications`.

### Unique Constraints
- `User.email` is strictly unique at the database level to prevent duplicate accounts.

### Enums
- **Role**: `ADMINISTRATOR`, `PROJECT_MANAGER`, `COLLABORATOR`
- **ProjectStatus**: `PLANNING`, `IN_PROGRESS`, `ACTIVE`, `COMPLETED`
- **TaskStatus**: `TODO`, `IN_PROGRESS`, `COMPLETED`
- **Priority**: `LOW`, `MEDIUM`, `HIGH`
