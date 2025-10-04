'use client';

import { useEffect, useState } from 'react';
import { Todo } from '@/types/todo';
import * as api from '@/lib/api';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      const data = await api.getTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error('Error in loadTodos:', err);
      setError(`Failed to load todos: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    console.log('Form submitted with title:', newTodoTitle);
    
    if (!newTodoTitle.trim()) {
      console.log('Empty title, returning');
      return;
    }

    try {
      console.log('Calling createTodo API...');
      const newTodo = await api.createTodo(newTodoTitle);
      console.log('API call successful, new todo:', newTodo);
      setTodos([...todos, newTodo]);
      setNewTodoTitle('');
      setError(null);
    } catch (err) {
      console.error('Error in handleAddTodo:', err);
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  }

  async function handleToggleTodo(todo: Todo) {
    try {
      const updatedTodo = await api.updateTodo(todo.id!, { completed: !todo.completed });
      setTodos(todos.map(t => 
        t.id === todo.id ? updatedTodo : t
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
    }
  }

  function handleStartEdit(todo: Todo) {
    setEditingId(todo.id!);
    setEditingTitle(todo.title);
  }

  async function handleSaveEdit(id: number) {
    if (!editingTitle.trim()) return;
    
    try {
      const updatedTodo = await api.updateTodo(id, { title: editingTitle });
      setTodos(todos.map(todo =>
        todo.id === id ? updatedTodo : todo
      ));
      setEditingId(null);
      setEditingTitle('');
      setError(null);
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingTitle('');
  }

  async function handleDeleteTodo(id: number) {
    try {
      await api.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
    }
  }

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Todo List</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleAddTodo} className="mb-4" data-testid="todo-form">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-400"
            data-testid="todo-input"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="todo-submit"
            onClick={() => console.log('Add button clicked')}
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {/* Active Todos Section */}
        <section>
          <h2 className="text-lg font-semibold text-black mb-3">Active Tasks</h2>
          <ul className="space-y-2">
            {todos.filter(todo => !todo.completed).map(todo => (
              <li
                key={todo.id}
                className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50"
              >
                <button
                  onClick={() => handleToggleTodo(todo)}
                  className="flex items-center justify-center h-6 w-6 rounded border bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                  title="Mark as completed"
                >
                  <div className="w-3 h-3 border border-gray-400 rounded-sm opacity-30 hover:opacity-60"></div>
                </button>
                {editingId === todo.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-black"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(todo.id!)}
                      className="px-3 py-1 text-green-600 hover:bg-green-100 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-black flex-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-all duration-200"
                        onClick={() => handleStartEdit(todo)}
                      >
                        {todo.title}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 px-2">
                      <span>Created: {new Date(todo.createdAt!).toLocaleString()}</span>
                      {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
                        <span className="ml-2">• Updated: {new Date(todo.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleDeleteTodo(todo.id!)}
                  className="px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
            {todos.filter(todo => !todo.completed).length === 0 && (
              <p className="text-center text-gray-500 py-4">No active tasks</p>
            )}
          </ul>
        </section>

        {/* Completed Todos Section */}
        <section className="border-t pt-6">
          <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
            Completed Tasks
            <span className="text-sm font-normal text-gray-500">
              ({todos.filter(todo => todo.completed).length})
            </span>
          </h2>
          <ul className="space-y-2">
            {todos.filter(todo => todo.completed).map(todo => (
              <li
                key={todo.id}
                className="flex items-start gap-2 p-2 border rounded bg-gray-50"
              >
                <button
                  onClick={() => handleToggleTodo(todo)}
                  className="flex items-center justify-center h-6 w-6 rounded border bg-green-500 border-green-500 hover:bg-green-600 transition-colors duration-200"
                >
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="line-through text-black/50 flex-1 px-2 py-1">
                      {todo.title}
                    </span>
                    <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded-full">
                      Completed
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 px-2">
                    <span>Created: {new Date(todo.createdAt!).toLocaleString()}</span>
                    {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
                      <span className="ml-2">• Updated: {new Date(todo.updatedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id!)}
                  className="px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
            {todos.filter(todo => todo.completed).length === 0 && (
              <p className="text-center text-gray-500 py-4">No completed tasks</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}