import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import TaskSeries from "../models/TaskSeries.js";
import { validateRRule } from "../utils/task-series.utils.js";
import Task from "../models/Task.js";

const router = Router();

router.post('/add', requireAuth, async (req, res) => {
    try {
        const { taskId, rrule } = req.body;

        if (!validateRRule(rrule)) {
            return res.status(400).json({ message: 'Invalid recurrence rule' });
        }

        const task = await Task.findOne({
            where: { id: taskId, userId: req.user.userId }
        })

        const series = await TaskSeries.create({
            name: task.name,
            rrule: rrule,
            startDate: task.date,
            userId: req.user.userId,
        });

        await task.update({ seriesId: series.id });

        return res.status(200);
    } catch (err) {
        console.error('Error creating task series:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/:seriesId', requireAuth, async (req, res) => {
    try {
        const { seriesId } = req.params;
        const { endDate } = req.body;

        const series = await TaskSeries.findOne({
            where: {
                id: seriesId,
                userId: req.user.userId,
            }
        });

        if (!series) {
            return res.status(404).json({ message: 'Task series not found' });
        }

        const end = new Date(endDate);
        end.setDate(end.getDate() - 1); // move back one day

        await series.update({
            endDate: end.toISOString().slice(0, 10)
        });

        return res.status(200).json({ message: 'Task series ended successfully' });
    } catch (err) {
        console.error('Error deleting task series:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;