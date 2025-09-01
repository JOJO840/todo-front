import React, { useEffect, useRef, useState } from "react";
import "./Task.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import { taskService } from "../services/taskService";

export default function Task() {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all"); // <-- NEW
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        // datetime-local wants "YYYY-MM-DDTHH:mm"
        dueDate: "",
        assigneeUsername: "",
    });

    // load tasks on mount
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await taskService.getAll();
                setTasks(data || []);
            } catch (e) {
                console.error("Failed to load tasks:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const files = fileInputRef.current?.files;
            await taskService.create(
                {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    // taskService will convert to backend format
                    dueDate: form.dueDate ? new Date(form.dueDate) : null,
                    assigneeUsername: form.assigneeUsername || null,
                },
                files && files.length ? files : null
            );

            // reload list
            const data = await taskService.getAll();
            setTasks(data || []);

            // reset form
            setForm({ title: "", description: "", dueDate: "", assigneeUsername: "" });
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (e) {
            console.error("Create failed:", e);
            alert(e.message || "Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async (id) => {
        if (!confirm("Delete this task?")) return;
        try {
            setLoading(true);
            await taskService.delete(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (e) {
            console.error("Delete failed:", e);
            alert(e.message || "Failed to delete");
        } finally {
            setLoading(false);
        }
    };

    // Filter tasks by status
    const filteredTasks =
        statusFilter === "all"
            ? tasks
            : tasks.filter((t) => t.status === statusFilter);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={false} onClose={() => {}} />
            <main className="dashboard-main">
                <Header
                    title="Tasks"
                    subtitle="Manage and organize your tasks"
                    rightContent={loading ? <span className="text-muted">Loading…</span> : null}
                />

                <div className="container-fluid px-4">
                    <div className="row">
                        <div className="col-12 col-lg-10 col-xl-8">
                            {/* Add Task card */}
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title mb-4">Add New Task</h2>

                                    <form onSubmit={onSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="todoTitle">Title</label>
                                            <input
                                                id="todoTitle"
                                                name="title"
                                                className="form-control"
                                                value={form.title}
                                                onChange={onChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="todoDescription">Description</label>
                                            <textarea
                                                id="todoDescription"
                                                name="description"
                                                className="form-control"
                                                rows="3"
                                                value={form.description}
                                                onChange={onChange}
                                            />
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label" htmlFor="todoDueDate">Due Date</label>
                                                <input
                                                    id="todoDueDate"
                                                    name="dueDate"
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={form.dueDate}
                                                    onChange={onChange}
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label" htmlFor="todoPerson">Assign to Person</label>
                                                <select
                                                    id="todoPerson"
                                                    name="assigneeUsername"
                                                    className="form-select"
                                                    value={form.assigneeUsername}
                                                    onChange={onChange}
                                                >
                                                    <option value="">-- Select Person (Optional) --</option>
                                                    {/* replace with API-driven users later */}
                                                    <option value="admin">Admin</option>
                                                    <option value="user1">user1</option>
                                                    <option value="user2">user2</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Attachments</label>
                                            <div className="input-group">
                                                <input
                                                    ref={fileInputRef}
                                                    id="todoAttachments"
                                                    type="file"
                                                    className="form-control"
                                                    multiple
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    type="button"
                                                    onClick={() => fileInputRef.current && (fileInputRef.current.value = null)}
                                                    title="Clear files"
                                                >
                                                    <i className="bi bi-x-lg" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                <i className="bi bi-plus-lg me-2" />
                                                Add Task
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Status Tabs */}
                            <div className="card shadow-sm mt-4">
                                <div className="card-header bg-white">
                                    <div className="btn-group" role="group">
                                        <button
                                            type="button"
                                            className={`btn btn-outline-primary${statusFilter === "all" ? " active" : ""}`}
                                            onClick={() => setStatusFilter("all")}
                                        >
                                            All
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-outline-primary${statusFilter === "pending" ? " active" : ""}`}
                                            onClick={() => setStatusFilter("pending")}
                                        >
                                            Pending
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-outline-primary${statusFilter === "completed" ? " active" : ""}`}
                                            onClick={() => setStatusFilter("completed")}
                                        >
                                            Completed
                                        </button>
                                    </div>
                                </div>

                                {/* Tasks list */}
                                <div className="list-group list-group-flush">
                                    {filteredTasks.length === 0 && (
                                        <div className="list-group-item text-muted">No tasks yet.</div>
                                    )}

                                    {filteredTasks.map((t) => (
                                        <div key={t.id} className="list-group-item list-group-item-action">
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between">
                                                        <h6 className="mb-1">{t.title}</h6>
                                                        {/* createdAt/dueDate fields may differ in your DTO */}
                                                        {t.createdAt && (
                                                            <small className="text-muted ms-2">
                                                                Created: {String(t.createdAt).slice(0, 10)}
                                                            </small>
                                                        )}
                                                    </div>
                                                    {t.description && (
                                                        <p className="mb-1 text-muted small">{t.description}</p>
                                                    )}
                                                    <div className="d-flex align-items-center flex-wrap">
                                                        {t.dueDate && (
                                                            <small className="text-muted me-2">
                                                                <i className="bi bi-calendar-event" /> Due: {String(t.dueDate).slice(0, 10)}
                                                            </small>
                                                        )}
                                                        {t.assignee && (
                                                            <span className="badge rounded-pill bg-info-subtle text-info-emphasis me-2">
                                                                {t.assignee.name || t.assignee.username}
                                                            </span>
                                                        )}
                                                        {t.status && (
                                                            <span className="badge bg-warning text-dark me-2">{t.status}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="btn-group ms-3">
                                                    {/* Hook up edit later */}
                                                    <button className="btn btn-outline-danger btn-sm" title="Delete" onClick={() => onDelete(t.id)}>
                                                        <i className="bi bi-trash" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}