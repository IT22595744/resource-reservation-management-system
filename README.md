# ReserveHub — Resource Reservation Management System

A full-stack resource reservation management application developed as part of the **PrimeWave Lab (Pvt) Ltd — Software Engineering Internship Technical Assessment**.

ReserveHub provides a centralized platform for managing shared organizational resources, checking availability, and coordinating reservations. It replaces informal booking processes with a structured system designed to reduce scheduling conflicts and improve resource utilization.

##  hosted URL 
i have hosted the application ,URL is below 
Vercel_Domain_URL = https://resource-reservation-management-sys-ashy.vercel.app/

## 1. Project Overview

Organizations frequently share resources such as meeting rooms, equipment, and facilities. Managing reservations through informal communication or manual records can lead to overlapping bookings, scheduling confusion, and uncertainty about availability.

ReserveHub addresses these challenges through a centralized web application that allows users to discover resources, create reservations, manage their bookings, and view resource availability.

Administrators can maintain the resource catalog and control resource availability.

### Key Objectives

- Centralize shared resource management.
- Prevent overlapping reservations for the same resource.
- Provide clear resource availability information.
- Support secure user authentication and role-based authorization.
- Allow users to manage their own reservations.
- Maintain reliable reservation records in PostgreSQL.
- Deliver a responsive and practical user experience.

## 2. Key Features

### Authentication and Authorization

- User registration and login.
- Secure password hashing using bcryptjs.
- Session-based authentication using Auth.js.
- Role-based authorization with `ADMIN` and `USER` roles.
- Protected dashboard pages and API endpoints.

### Resource Management

- Browse shared organizational resources.
- Search and filter available resources.
- View resource details, descriptions, categories, and locations.
- Display resource images stored using Cloudinary.
- Create and update resources through the administrator interface.
- Activate and deactivate resources without permanently deleting their records.

### Reservation Management

- Create reservations for available resources.
- Select reservation start and end times.
- Check resource availability before booking.
- Prevent overlapping confirmed reservations.
- View upcoming bookings and reservation history.
- Cancel existing reservations.
- Rebook time slots released through cancellation.
- Prevent users from modifying reservations belonging to other users.

### Admin Category Management

ReserveHub provides a complete category management module accessible exclusively to administrators.

- Create: Add new resource categories through the dashboard.
- Read: View and search categories, including their assigned resource counts.
- Update: Rename existing categories without affecting associated resources.
- Delete: Remove categories that have no associated resources.
- Data integrity: Prevent deletion of categories containing resources.
- Security: Protect category modification endpoints with administrator role-based authorization.

### Dashboard

- Personalized welcome section.
- Total resource statistics.
- Available resource statistics.
- User reservation statistics.
- Upcoming reservation counts.
- Next confirmed reservation details.
- Quick navigation to resources and reservations.
- Administrator-specific resource management access.

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Full-stack framework | Next.js 16 (App Router) |
| Programming language | TypeScript |
| UI | React, Tailwind CSS |
| Icons | Lucide React |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Authentication | Auth.js / NextAuth |
| Password security | bcryptjs |
| Validation | Zod |
| Image storage | Cloudinary |
| Version control | Git and GitHub |

## 4. System Architecture

ReserveHub follows a full-stack architecture using Next.js App Router.

**Presentation Layer:** React components and Tailwind CSS provide responsive interfaces for authentication, resource discovery, reservations, and administration.

**Application Layer:** Next.js server components and API route handlers manage application requests, session checks, validation, and business operations.

**Business Logic Layer:** Server-side services implement resource management, reservation processing, and availability checks.

**Data Access Layer:** Prisma ORM communicates with the PostgreSQL database through the configured database adapter.

**External Image Storage:** Cloudinary stores resource images, while image references are maintained in the database.

### Request Flow

1. A user interacts with the ReserveHub interface.
2. The application authenticates the user and checks the required permissions.
3. Submitted data is validated before processing.
4. Server-side business logic performs the requested operation.
5. Prisma reads or updates the PostgreSQL database.
6. The application returns the result and updates the interface.

## 5. Database Design

The database contains four primary entities.

### User

Stores registered user accounts and their authorization roles.

### Category

Organizes resources into logical groups.

### Resource

Stores information about shared organizational resources, including their category, location, availability status, and optional image references.

### Reservation

Stores bookings created by users for particular resources, including reservation times and status.

### Entity Relationships

- One user can create multiple reservations.
- One category can contain multiple resources.
- One resource can have multiple reservations.
- Each reservation belongs to one user and one resource.

### Reservation Integrity

A major engineering requirement is preventing multiple users from reserving the same resource for overlapping time periods.

ReserveHub implements reservation conflict prevention through application-level availability checks and a PostgreSQL exclusion constraint.

Two reservations overlap when:

`newStart < existingEnd AND newEnd > existingStart`

The database constraint prevents overlapping confirmed reservations for the same resource, including situations where concurrent requests occur.

Cancelled reservations do not block future bookings.

The database also enforces valid reservation time ranges.

### Time Zone Handling

Reservation timestamps are stored consistently and displayed using the `Asia/Colombo` time zone for the Sri Lankan user interface.

## 6. Project Structure

The main application directories are organized as follows:

```text
resource-reservation-management-system/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── register/
│   │   │   ├── reservations/
│   │   │   ├── resources/
│   │   │   └── uploads/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── reservations/
│   │   │   └── resources/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── reservations/
│   │   └── resources/
│   ├── generated/
│   └── lib/
├── auth.ts
├── next.config.ts
├── package.json
├── prisma.config.ts
└── README.md
```

## 7. Installation and Local Setup

### Prerequisites

Ensure the following tools and services are available:

- Node.js 22 or a compatible version.
- npm.
- Git.
- A PostgreSQL database, such as Neon.
- A Cloudinary account for resource image uploads.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/IT22595744/resource-reservation-management-system.git
cd resource-reservation-management-system
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Configure Environment Variables

Create a `.env` file in the project root.

Configure the environment variables required by the application:

```dotenv
DATABASE_URL="your_postgresql_connection_string"
AUTH_SECRET="your_generated_auth_secret"
AUTH_TRUST_HOST="true"

CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

`DATABASE_URL` must point to an accessible PostgreSQL database.

`AUTH_SECRET` is used by Auth.js to protect authentication sessions. Generate a sufficiently strong random secret rather than using a sample value.

Cloudinary credentials are required for uploading resource images.

**Security:** Never commit `.env` files, database passwords, authentication secrets, or Cloudinary API secrets to GitHub.

### Step 4 — Generate the Prisma Client

```bash
npx prisma generate
```

### Step 5 — Apply Database Migrations

For a new database, apply the existing migrations:

```bash
npx prisma migrate deploy
```

The migrations must include the database constraints required for reservation integrity.

### Step 6 — Start the Development Server

```bash
npm run dev
```

Open:

http://localhost:3000

Create a user account through the registration page.

New accounts receive standard user permissions. Administrative access requires an account assigned the `ADMIN` role through an authorized setup process.

### Step 7 — Verify the Production Build

```bash
npx tsc --noEmit
npx eslint src
npm run build
```

To run the compiled application locally:

```bash
npm run start
```

## 8. User Roles and Permissions

| Functionality | USER | ADMIN |
|---|---|---|
| Register and log in | Yes | Yes |
| Browse resources | Yes | Yes |
| View resource availability | Yes | Yes |
| Create reservations | Yes | Yes |
| View own reservations | Yes | Yes |
| Cancel own reservations | Yes | Yes |
| Create resources | No | Yes |
| Update resources | No | Yes |
| Activate or deactivate resources | No | Yes |
| Upload resource images through the admin workflow | No | Yes |

Authorization is enforced server-side. Hiding administrative navigation links is not used as the sole security mechanism.

## 9. API Overview

### Authentication

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/register` | POST | Register a user |
| `/api/auth/[...nextauth]` | Auth.js | Authentication and session operations |

### Resources

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/resources` | GET | Retrieve resources |
| `/api/resources` | POST | Create a resource (ADMIN) |
| `/api/resources/[id]` | GET | Retrieve resource details |
| `/api/resources/[id]` | PATCH | Update a resource (ADMIN) |
| `/api/resources/[id]` | DELETE | Deactivate a resource (ADMIN) |
| `/api/resources/[id]/availability` | GET | Check resource availability |

### Reservations

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/reservations` | GET | Retrieve the user's reservations |
| `/api/reservations` | POST | Create a reservation |
| `/api/reservations/[id]` | PATCH | Cancel a reservation |

### Resource Images

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/uploads/resource-image` | POST | Upload a resource image (ADMIN) |

Resource image uploads support JPEG, PNG, and WebP files, subject to server-side validation and file-size limits.

## 10. Testing and Verification

ReserveHub was verified using TypeScript, ESLint, Next.js production build checks, and manual functional testing.

### Build Verification

- TypeScript type checking completed successfully.
- ESLint completed without reported errors.
- Next.js production build completed successfully.

### Authentication Testing

- User registration and login.
- Invalid credential handling.
- Session-based navigation.
- Protected dashboard routes.
- Role-based restrictions for administrator pages.

### Resource Management Testing

- Create resources.
- Edit resource details.
- Upload resource images.
- Activate and deactivate resources.
- Browse and filter resources.
- Verify administrator-only operations.

### Reservation Testing

- Create valid reservations.
- Reject identical and partially overlapping reservations.
- Reject reservations containing an existing booking.
- Allow adjacent non-overlapping bookings.
- Allow bookings for different resources at the same time.
- Reject invalid reservation time ranges.
- Cancel reservations.
- Rebook released time slots.
- Enforce reservation ownership restrictions.

## 11. Key Engineering Decisions

### Database-Level Conflict Prevention

Application-level checks alone may not prevent two simultaneous requests from creating conflicting bookings.

A PostgreSQL exclusion constraint provides an additional database-level safeguard to protect reservation integrity.

### Soft Deactivation of Resources

Resources are deactivated rather than permanently removed, helping preserve existing reservation records and historical relationships.

### Role-Based Access Control

Administrative operations are restricted through server-side authorization checks to prevent unauthorized resource modifications.

### Persistent Database Storage

PostgreSQL provides durable storage for users, resources, categories, and reservations.

### Server-Side Validation

Validation helps prevent malformed or invalid data from being processed and persisted.

### Responsive User Interface

The application is designed to support practical resource discovery and booking workflows across desktop and mobile screen sizes.

### Maintainable Application Structure

The codebase separates user interface components, API handlers, business logic, and database access to make the application easier to understand and maintain.

## 12. Demonstration and ER Diagram

The following assessment materials will be provided with the final submission:

## Demonstration Video

Watch the ReserveHub demonstration video:

DEMO_VIDEO_GOOGLE_DRIVE_LINK = https://drive.google.com/file/d/1IAZ5Q_SlywvP2D1IZkRNulwyTov5gSeE/view?usp=sharing

## Database ER Diagram

View the database entity relationship diagram:

ER_DIAGRAM_GOOGLE_DRIVE_LINK = https://drive.google.com/file/d/1Y3czMBJBhPNO1z5MP9b24mDfrxke__9x/view?usp=drive_link

ER_DIAGRAM_URL = https://dbdiagram.io/d/ReserveHub-—-Resource-Reservation-Management-System-6acf6880064322c86949ebb6

The demonstration covers the business problem, application features, reservation conflict prevention, and important engineering decisions.

## 13. Assessment Context

**Assessment:** Software Engineering Internship Technical Assessment

**Organization:** PrimeWave Lab (Pvt) Ltd

**Project:** Resource Reservation Management System

**Purpose:** Demonstrate practical full-stack engineering skills through a reliable and maintainable solution to a real-world resource scheduling problem.

## 14. Future Improvements

Potential enhancements include:

- Email notifications and booking reminders.
- Administrative reporting and resource utilization analytics.
- Recurring reservations.
- Calendar integration.
- Additional organizational roles and approval workflows.

These features are outside the current assessment scope and can be considered for future development.

---

**ReserveHub — Simplifying shared resource management through reliable scheduling and centralized reservations.**