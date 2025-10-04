# Todo Frontend

A modern Todo application frontend built with Next.js, TypeScript, and Tailwind CSS. This app connects to a Quarkus backend API to provide full CRUD functionality for managing todos.

## Features

- ✅ **Add new todos** with a clean, intuitive interface
- ✅ **Toggle completion status** by clicking checkboxes
- ✅ **Edit todo titles** inline with click-to-edit functionality
- ✅ **Delete todos** with confirmation
- ✅ **Separate sections** for active and completed tasks
- ✅ **Real-time updates** with backend synchronization
- ✅ **Responsive design** with Tailwind CSS
- ✅ **TypeScript** for type safety
- ✅ **Error handling** with user-friendly messages

## Tech Stack

- **Next.js 15** - React framework with Turbopack
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management
- **Fetch API** - HTTP client for backend communication

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Quarkus backend API running on `http://localhost:8080`

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## API Integration

This frontend connects to a Quarkus backend API with the following endpoints:

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/{id}` - Update a todo (title and/or completion status)
- `DELETE /api/todos/{id}` - Delete a todo

### Expected Todo Structure
```typescript
interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page with TodoList
├── components/
│   └── TodoList.tsx         # Main Todo component with CRUD operations
├── lib/
│   └── api.ts              # API client for backend communication
└── types/
    └── todo.ts             # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Configuration

The API base URL is configured in `src/lib/api.ts`:
```typescript
const API_URL = 'http://localhost:8080/api';
```

Update this URL if your backend runs on a different host or port.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
