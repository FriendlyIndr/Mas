import { Router } from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

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

export default router;