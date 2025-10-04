const API_URL = 'http://localhost:8080/api';

export async function getTodos() {
  try {
    console.log('Fetching todos from:', `${API_URL}/todos`);
    const response = await fetch(`${API_URL}/todos`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received todos:', data);
    return data;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function getTodo(id: number) {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors'
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function createTodo(title: string) {
  try {
    console.log('Creating new todo:', { title, completed: false });
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ title, completed: false }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Successfully created todo:', data);
    return data;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
  }

export async function updateTodo(id: number, updates: { title?: string; completed?: boolean }) {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function deleteTodo(id: number) {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    mode: 'cors'
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

export async function getCompletedTodos() {
  const response = await fetch(`${API_URL}/todos/completed`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors'
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}