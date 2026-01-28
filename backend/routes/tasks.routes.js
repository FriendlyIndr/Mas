import { Router } from "express";
import Task from "../models/Task.js";

const router = Router();

router.post('/add', async (req, res) => {
    try {
        // Get task
        const { name, done, date, order } = req.body;

        // Create Task object
        const createdTask = await Task.create({
            name,
            done,
            date,
            order,
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