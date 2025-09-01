import api from "./http";

// format "YYYY-MM-DDTHH:mm:ss" for LocalDateTime
function toBackendDate(value) {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() + "-" +
    pad(d.getMonth() + 1) + "-" +
    pad(d.getDate()) + "T" +
    pad(d.getHours()) + ":" +
    pad(d.getMinutes()) + ":" +
    pad(d.getSeconds())
  );
}

export const taskService = {
  async getAll() {
    const res = await api.get("/api/todo");         // <- was /api/tasks
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/api/todo/${id}`);   // <- was /api/tasks/${id}
    return res.data;
  },

  async create(task) {
    // Match TodoDto fields used by the backend
    const payload = {
      title: task.title ?? "",
      description: task.description ?? "",
      dueDate: task.dueDate ? toBackendDate(task.dueDate) : null,
      personId: task.personId ?? null,             // or map from assigneeUsername if you add that later
      completed: false,
    };
    const res = await api.post("/api/todo", payload);   // <- JSON body
    return res.data;
  },

  async update(id, task) {
    const payload = {
      id,
      title: task.title ?? "",
      description: task.description ?? "",
      dueDate: task.dueDate ? toBackendDate(task.dueDate) : null,
      personId: task.personId ?? null,
      completed: Boolean(task.completed),
    };
    const res = await api.put(`/api/todo/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/api/todo/${id}`);
    return res.data ?? true; // tolerate 204
  },
};
