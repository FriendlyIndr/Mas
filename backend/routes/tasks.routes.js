import { Router } from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { Op, Sequelize, where } from "sequelize";
import TaskSeries from "../models/TaskSeries.js";
import pkg from 'rrule';
import TaskException from "../models/TaskException.js";
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
            },
            include: [
                {
                    model: TaskSeries,
                    as: 'subtasks',
                }
            ]
        });

        const seriesIds = seriesList.map(s => s.id);

        // Find exceptions to series
        const exceptions = await TaskException.findAll({
            where: {
                userId: req.user.userId,
                seriesId: { [Op.in]: seriesIds },
                [Op.or]: [
                    { date: { [Op.between]: [start, end] } },
                    { overriddenDate: { [Op.between]: [start, end] } },
                ]
            }
        });

        // Index exceptions (create fast lookup maps)
        const exceptionMap = new Map(); // for original occurrence
        const movedToMap = new Map(); // for overridden dates 

        for (const ex of exceptions) {
            const key = `${ex.seriesId}_${ex.date}`;
            exceptionMap.set(key, ex);

            if (ex.overriddenDate) {
                const movedToKey = `${ex.seriesId}_${ex.overriddenDate}`;
                movedToMap.set(movedToKey, ex);
            }
        }

        let recurringTasks = [];

        for (const series of seriesList) {
            const rule = new RRule({
                ...RRule.parseString(series.rrule),
                dtstart: new Date(series.startDate),
            });

            const endDateObj = new Date(end);
            endDateObj.setUTCHours(23, 59, 59, 999);

            const seriesEnd = series.endDate
                ? new Date(series.endDate)
                : endDateObj;

            const generationEnd = new Date(Math.min(seriesEnd, endDateObj));

            const occurrences = rule.between(
                new Date(start),
                generationEnd,
                true
            );

            for (const occ of occurrences) {
                if (occ.toISOString().slice(0, 10) === series.startDate) continue;

                const originalDate = occ.toISOString().slice(0, 10);
                const key = `${series.id}_${originalDate}`;
                const exception = exceptionMap.get(key);

                let finalDate = originalDate;
                let name = series.name;
                let done = false;
                let order = null;

                // Moved occurrence
                if (exception?.overriddenDate) {
                    finalDate = exception.overriddenDate;
                }

                if (exception?.done !== undefined) {
                    done = exception.done;
                }

                if (series.subtasks?.length) {
                    for (const sub of series.subtasks) {

                        if (sub.endDate && new Date(sub.endDate) < new Date(finalDate)) continue;

                        // create virtual recurring subtask
                        recurringTasks.push({
                            id: `sub-${sub.id}-${originalDate}`,
                            name: sub.name,
                            done: false,
                            order: null,
                            date: finalDate,
                            seriesId: sub.id,
                            parentId: sub.parentId,
                            isRecurring: true,
                            isSubTask: true
                        });
                    }
                }

                if (!series.parentId) {
                    recurringTasks.push({
                        id: `series-${series.id}-${originalDate}`,
                        name,
                        done,
                        order,
                        date: finalDate,
                        seriesId: series.id,
                        rrule: series.rrule,
                        isRecurring: true,
                    });
                }
            }
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