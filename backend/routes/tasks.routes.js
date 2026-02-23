import { Router } from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { Op, Sequelize, where } from "sequelize";
import TaskSeries from "../models/TaskSeries.js";
import pkg from 'rrule';
const { RRule } = pkg;

const router = Router();

router.post('/add', requireAuth, async (req, res) => {
    try {
        // Get task
        const { name, done, date, order } = req.body;

        // Create Task object
        const createdTask = await Task.create({
            name,
            done,
            date,
            order,
            userId: req.user.userId,
        });

        return res.status(201).json({
            createdTask,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
});

router.get('', requireAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        // Valid date check
        if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
            return res.status(400).json({ 
                message: 'Invalid date format (expected YYYY-MM-DD)' 
            });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: 'startDate must be earlier than endDate' });
        }
        
        const start = new Date(startDate).toISOString().slice(0, 10);
        const end = new Date(endDate).toISOString().slice(0, 10);

        // Find user tasks for the week
        const tasks = await Task.findAll({
            where: {
                userId: req.user.userId,
                date: {
                    [Op.between]: [start, end]
                }
            }
        });

        const seriesList = await TaskSeries.findAll({
            where: {
                userId: req.user.userId,
                startDate: { [Op.lte]: end },
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: start } }
                ]
            }
        });

        let recurringTasks = [];

        for(const series of seriesList) {
            const rule = RRule.fromString(series.rrule);

            const endDateObj = new Date(end);
            endDateObj.setUTCHours(23, 59, 59, 999);

            const occurrences = rule.between(
                new Date(start),
                endDateObj,
                true
            );

            const generatedTasksForSeries = occurrences
                .filter(date => date.toISOString().slice(0, 10) !== series.startDate) // to not generate duplicate of first task
                .map((date) => ({
                    id: `series-${series.id}-${date.toISOString()}`, // fake id
                    name: series.name,
                    done: false,
                    date: date.toISOString().slice(0, 10),
                    seriesId: series.id,
                }));

            recurringTasks.push(...generatedTasksForSeries);
        }

        return res.status(200).json({
            tasks: [ ...tasks, ...recurringTasks ],
        });
    } catch (err) {
        console.error('Error getting tasks:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.patch('/move', requireAuth, async (req, res) => {
    try {
        const { tasks } = req.body;

        if (!Array.isArray(tasks)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        // Update tasks
        const updates = tasks.map(t =>
            Task.update(
                { date: t.date, order: t.order },  // Identify tasks
                { where: { id: t.id, userId: req.user.userId } }
            )
        );

        await Promise.all(updates);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.patch('/:taskId', requireAuth, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { name, done } = req.body;
        console.log('taskId:', taskId);

        // Update Task object
        const updatedTask = await Task.update(
            { name, done },
            { where: { id: taskId, userId: req.user.userId, } }
        );

        return res.status(200).json({ updatedTask });
    } catch (err) {
        console.error('Error checking tasking:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/:taskId', requireAuth, async (req, res) => {
    try {
        // Find task
        const { taskId } = req.params;

        const deletedTaskCount = await Task.destroy({
            where: {
                id: taskId,
            },
        });

        if (deletedTaskCount === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;