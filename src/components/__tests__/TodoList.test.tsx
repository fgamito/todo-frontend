import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '../TodoList';
import * as api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('TodoList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should display loading state initially', () => {
      mockApi.getTodos.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<TodoList />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should fetch and display todos on mount', async () => {
      const mockTodos = [
        { id: 1, title: 'Test Todo 1', completed: false, createdAt: '2025-01-01T00:00:00Z' },
        { id: 2, title: 'Test Todo 2', completed: true, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
      });
    });

    it('should display error message when fetching todos fails', async () => {
      mockApi.getTodos.mockRejectedValueOnce(new Error('Network error'));

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to load todos: Network error');
      });
    });
  });

  describe('Adding Todos', () => {
    beforeEach(() => {
      mockApi.getTodos.mockResolvedValueOnce([]);
    });

    it('should add a new todo when form is submitted', async () => {
      const user = userEvent.setup();
      const newTodo = { id: 1, title: 'New Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' };
      mockApi.createTodo.mockResolvedValueOnce(newTodo);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const input = screen.getByTestId('todo-input');
      const submitButton = screen.getByTestId('todo-submit');

      await user.type(input, 'New Todo');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.createTodo).toHaveBeenCalledWith('New Todo');
        expect(screen.getByText('New Todo')).toBeInTheDocument();
      });
    });

    it('should not add todo with empty title', async () => {
      const user = userEvent.setup();
      render(<TodoList />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const submitButton = screen.getByTestId('todo-submit');
      await user.click(submitButton);

      expect(mockApi.createTodo).not.toHaveBeenCalled();
    });

    it('should clear input after successfully adding todo', async () => {
      const user = userEvent.setup();
      const newTodo = { id: 1, title: 'New Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' };
      mockApi.createTodo.mockResolvedValueOnce(newTodo);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const input = screen.getByTestId('todo-input') as HTMLInputElement;
      await user.type(input, 'New Todo');
      await user.click(screen.getByTestId('todo-submit'));

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should display error when adding todo fails', async () => {
      const user = userEvent.setup();
      mockApi.createTodo.mockRejectedValueOnce(new Error('Failed to create'));

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const input = screen.getByTestId('todo-input');
      await user.type(input, 'New Todo');
      await user.click(screen.getByTestId('todo-submit'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Toggling Todo Completion', () => {
    it('should toggle todo completion status', async () => {
      const mockTodos = [
        { id: 1, title: 'Test Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];
      const updatedTodo = { ...mockTodos[0], completed: true };

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);
      mockApi.updateTodo.mockResolvedValueOnce(updatedTodo);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Find the checkbox button (it's the button before the todo text)
      const checkboxButton = screen.getByTitle('Mark as completed');
      fireEvent.click(checkboxButton);

      await waitFor(() => {
        expect(mockApi.updateTodo).toHaveBeenCalledWith(1, { completed: true });
      });
    });

    it('should display error when toggling fails', async () => {
      const mockTodos = [
        { id: 1, title: 'Test Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);
      mockApi.updateTodo.mockRejectedValueOnce(new Error('Update failed'));

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const checkboxButton = screen.getByTitle('Mark as completed');
      fireEvent.click(checkboxButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update todo')).toBeInTheDocument();
      });
    });
  });

  describe('Editing Todos', () => {
    it('should enter edit mode when clicking on todo title', async () => {
      const user = userEvent.setup();
      const mockTodos = [
        { id: 1, title: 'Test Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const todoTitle = screen.getByText('Test Todo');
      await user.click(todoTitle);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    it('should save edited todo', async () => {
      const user = userEvent.setup();
      const mockTodos = [
        { id: 1, title: 'Test Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];
      const updatedTodo = { ...mockTodos[0], title: 'Updated Todo' };

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);
      mockApi.updateTodo.mockResolvedValueOnce(updatedTodo);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const todoTitle = screen.getByText('Test Todo');
      await user.click(todoTitle);

      const input = screen.getByDisplayValue('Test Todo') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'Updated Todo');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockApi.updateTodo).toHaveBeenCalledWith(1, { title: 'Updated Todo' });
        expect(screen.getByText('Updated Todo')).toBeInTheDocument();
      });
    });

    it('should cancel editing', async () => {
      const user = userEvent.setup();
      const mockTodos = [
        { id: 1, title: 'Test Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const todoTitle = screen.getByText('Test Todo');
      await user.click(todoTitle);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByDisplayValue('Test Todo')).not.toBeInTheDocument();
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });
    });
  });

  describe('Deleting Todos', () => {
    it('should delete a todo', async () => {
      const user = userEvent.setup();
      const mockTodos = [
        { id: 1, title: 'Test Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);
      mockApi.deleteTodo.mockResolvedValueOnce(undefined);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockApi.deleteTodo).toHaveBeenCalledWith(1);
        expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
      });
    });

    it('should display error when deletion fails', async () => {
      const user = userEvent.setup();
      const mockTodos = [
        { id: 1, title: 'Test Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);
      mockApi.deleteTodo.mockRejectedValueOnce(new Error('Delete failed'));

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete todo')).toBeInTheDocument();
      });
    });
  });

  describe('Todo Sections', () => {
    it('should separate active and completed todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Active Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
        { id: 2, title: 'Completed Todo', completed: true, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('Active Tasks')).toBeInTheDocument();
        expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
        expect(screen.getByText('Active Todo')).toBeInTheDocument();
        expect(screen.getByText('Completed Todo')).toBeInTheDocument();
      });
    });

    it('should show message when no active todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Completed Todo', completed: true, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('No active tasks')).toBeInTheDocument();
      });
    });

    it('should show message when no completed todos', async () => {
      const mockTodos = [
        { id: 1, title: 'Active Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('No completed tasks')).toBeInTheDocument();
      });
    });

    it('should display completed count', async () => {
      const mockTodos = [
        { id: 1, title: 'Active Todo', completed: false, createdAt: '2025-01-01T00:00:00Z' },
        { id: 2, title: 'Completed Todo 1', completed: true, createdAt: '2025-01-01T00:00:00Z' },
        { id: 3, title: 'Completed Todo 2', completed: true, createdAt: '2025-01-01T00:00:00Z' },
      ];

      mockApi.getTodos.mockResolvedValueOnce(mockTodos);

      render(<TodoList />);

      await waitFor(() => {
        expect(screen.getByText('(2)')).toBeInTheDocument();
      });
    });
  });
});
