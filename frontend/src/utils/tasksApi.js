import { API_BASE } from "./api";
import apiFetch from "./apiFetch";

export async function toggleTaskDone(task) {
    if (task.isRecurring) {
        return toggleTaskException(task);
    } else {
        return toggleNormalTask(task);
    }
}

async function toggleNormalTask(task) {
    // Send request to check task endpoint
    const res = await apiFetch(`/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            done: !task.done,
        }),
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
}

async function toggleTaskException(task) {
    const res = await apiFetch('/task-exceptions/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            seriesId: task.seriesId,
            date: task.date,
            done: !task.done,
        }),
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
}