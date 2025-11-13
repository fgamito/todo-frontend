import { getTodos, getTodo, createTodo, updateTodo, deleteTodo, getCompletedTodos } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodos', () => {
    it('should fetch all todos successfully', async () => {
      const mockTodos = [
        { id: 1, title: 'Test Todo 1', completed: false },
        { id: 2, title: 'Test Todo 2', completed: true },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      });

      const result = await getTodos();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/todos', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      expect(result).toEqual(mockTodos);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getTodos()).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('getTodo', () => {
    it('should fetch a single todo by id', async () => {
      const mockTodo = { id: 1, title: 'Test Todo', completed: false };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodo,
      });

      const result = await getTodo(1);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/todos/1', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      expect(result).toEqual(mockTodo);
    });

    it('should throw error when todo not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getTodo(999)).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const mockTodo = { id: 1, title: 'New Todo', completed: false };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodo,
      });

      const result = await createTodo('New Todo');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/todos', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ title: 'New Todo', completed: false }),
      });
      expect(result).toEqual(mockTodo);
    });

    it('should throw error when creation fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(createTodo('Bad Todo')).rejects.toThrow('HTTP error! status: 400');
    });
  });

  describe('updateTodo', () => {
    it('should update a todo with title', async () => {
      const mockUpdatedTodo = { id: 1, title: 'Updated Todo', completed: false };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedTodo,
      });

      const result = await updateTodo(1, { title: 'Updated Todo' });

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/todos/1', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ title: 'Updated Todo' }),
      });
      expect(result).toEqual(mockUpdatedTodo);
    });

    it('should update a todo completion status', async () => {
      const mockUpdatedTodo = { id: 1, title: 'Test Todo', completed: true };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedTodo,
      });

      const result = await updateTodo(1, { completed: true });

      expect(result).toEqual(mockUpdatedTodo);
    });

    it('should throw error when update fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(updateTodo(999, { title: 'Updated' })).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteTodo(1);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/todos/1', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });
    });

    it('should throw error when delete fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(deleteTodo(999)).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('getCompletedTodos', () => {
    it('should fetch completed todos', async () => {
      const mockCompletedTodos = [
        { id: 2, title: 'Completed Todo', completed: true },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompletedTodos,
      });

      const result = await getCompletedTodos();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/todos/completed', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      expect(result).toEqual(mockCompletedTodos);
    });
  });
});
