import { Router } from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { Op, where } from "sequelize";

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

        return res.status(200).json({
            tasks,
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

export default router;