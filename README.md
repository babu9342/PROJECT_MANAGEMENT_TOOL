# FlowBoard — Collaborative Project Management Tool (Trello/Asana Clone)

A modern, production-ready full-stack project management platform with real-time Kanban boards, task assignment, instant discussions, and team collaboration.

---

## 🚀 Key Features

### 🔐 Authentication & Profile
- JWT token-based authentication with secure HTTP interceptors.
- User registration, login, and profile management with avatar uploads and bio.
- Protected routes on the frontend with role-based member permissions on the backend.

### 📊 Dashboard & Workspace Overview
- Real-time analytics metrics (total projects, completed tasks, in-progress tasks, overdue tasks).
- Recent projects grid with visual progress indicators and team avatars.
- Activity feed showing real-time updates and task status changes.

### 🗂️ Kanban Project Board
- Drag-and-drop task cards across 5 columns: **Backlog**, **To Do**, **In Progress**, **Review**, and **Done**.
- Real-time board synchronization via **Socket.io**.
- Instant task reordering and status transitions with optimistic UI updates.
- Priority levels (**Low**, **Medium**, **High**, **Critical**) with color-coded badges and urgency bars.
- Live search and priority filtering.

### 📝 Task Details & Interactive Collaboration
- In-place title, description, priority, assignee, and due date editing.
- Dynamic interactive checklists with progress bars.
- Custom tag/label management.
- Real-time comment threads with timestamps and delete permissions.
- Due date indicators with automatic overdue alerts.

### 👥 Team Collaboration
- Invite members by email with role assignment (Admin, Member, Viewer).
- Project member avatars and management dropdowns.
- Automatic notifications on task assignments, comments, and project invites.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Zustand, @hello-pangea/dnd, Socket.io-client, Lucide Icons, Date-fns, React Hot Toast |
| **Backend** | Node.js, Express.js, Socket.io, JWT, bcryptjs, Multer, Helmet, CORS, Morgan |
| **Database** | MongoDB with Mongoose ODM |

---

## 📁 Project Structure

```
PROJECT MANAGEMENT/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── CreateProjectModal.tsx
│   │   │   ├── CreateTaskModal.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskDetailModal.tsx
│   │   ├── pages/
│   │   │   ├── BoardPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── services.ts
│   │   │   └── socket.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── notificationStore.ts
│   │   │   ├── projectStore.ts
│   │   │   └── taskStore.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── socket.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── notificationController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Notification.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── comments.js
│   │   ├── notifications.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
*Server will start on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Client will start on `http://localhost:5173`*

---

## 🔌 API Reference

### Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/profile` — Get authenticated user profile
- `PUT /api/auth/profile` — Update user profile & avatar (multipart)
- `GET /api/auth/search?q=query` — Search users

### Projects
- `GET /api/projects` — List user's projects with progress stats
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get single project details
- `PUT /api/projects/:id` — Update project metadata
- `DELETE /api/projects/:id` — Delete project and associated tasks
- `POST /api/projects/:id/members` — Add member by email
- `DELETE /api/projects/:id/members/:userId` — Remove member

### Tasks
- `GET /api/tasks/stats` — User dashboard statistics
- `GET /api/tasks/:projectId` — List tasks for a project
- `POST /api/tasks` — Create task card
- `GET /api/tasks/detail/:id` — Get task with details
- `PUT /api/tasks/:id` — Update task fields
- `DELETE /api/tasks/:id` — Delete task
- `PUT /api/tasks/reorder` — Bulk reorder tasks on drag & drop

### Comments
- `GET /api/comments/:taskId` — List comments for a task
- `POST /api/comments` — Add comment to a task
- `PUT /api/comments/:id` — Update comment
- `DELETE /api/comments/:id` — Delete comment

### Notifications
- `GET /api/notifications` — Get user notifications
- `PUT /api/notifications/:id/read` — Mark notification read
- `PUT /api/notifications/read-all` — Mark all read
- `DELETE /api/notifications/:id` — Delete notification

---

## 🚀 Production Deployment

### Backend (Render / Railway / Heroku)
1. Set the following environment variables:
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/projectmanagement`
   - `JWT_SECRET=your_secure_production_secret`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`
   - `NODE_ENV=production`
2. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Configure API proxy or base URL in `.env.production`: `VITE_API_URL=https://your-backend.onrender.com`
