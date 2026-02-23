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

export default router;