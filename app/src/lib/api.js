const API_BASE = "/api";
const sessionStorageKey = "lozhka-session";

function readSession() {
  try {
    const value = window.localStorage.getItem(sessionStorageKey);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
  } catch {
    // The current tab can still continue with local auth state.
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(sessionStorageKey);
  } catch {
    // Nothing else to clear when storage is unavailable.
  }
}

export function getSession() {
  return readSession();
}

async function request(path, options = {}) {
  const session = readSession();
  const headers = {
    "Content-Type": "application/json",
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(session?.space?.id ? { "x-space-id": session.space.id } : {}),
    ...(session?.user?.id ? { "x-user-id": session.user.id } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function requestAuthCode(payload) {
  return request("/auth/request-code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyAuthCode(payload) {
  return request("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeAuth(payload) {
  return request("/auth/complete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentSession() {
  return request("/auth/me");
}

export function updateCurrentSession(payload) {
  return request("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}

export function fetchTasks() {
  return request("/tasks");
}

export function createTask(payload) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTaskCompletion(taskId, completed) {
  return request(`/tasks/${encodeURIComponent(taskId)}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
}
