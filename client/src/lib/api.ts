export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

// period logs API
export const periodLogsAPI = {
  getAll: () => fetchAPI("/api/period-logs"),
  create: (data: any) =>
    fetchAPI("/api/period-logs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/api/period-logs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI(`/api/period-logs/${id}`, {
      method: "DELETE",
    }),
};

// threads API
export const threadsAPI = {
  getAll: () => fetchAPI("/api/threads"),
  getOne: (id: string) => fetchAPI(`/api/threads/${id}`),
  create: (data: any) =>
    fetchAPI("/api/threads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  like: (id: string) =>
    fetchAPI(`/api/threads/${id}/like`, {
      method: "POST",
    }),
};

// comments API
export const commentsAPI = {
  getAll: (threadId: string) => fetchAPI(`/api/threads/${threadId}/comments`),
  create: (threadId: string, data: any) =>
    fetchAPI(`/api/threads/${threadId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  like: (id: string) =>
    fetchAPI(`/api/comments/${id}/like`, {
      method: "POST",
    }),
};
