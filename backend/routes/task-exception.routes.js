import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import TaskSeries from "../models/TaskSeries.js";
import { Op } from "sequelize";
import TaskException from "../models/TaskException.js";

const router = Router();

router.patch('/toggle', requireAuth, async (req, res) => {
    try {
        const { seriesId, date, done } = req.body;

        const series = await TaskSeries.findOne({
            where: {
                id: seriesId,
                userId: req.user.userId,
                startDate: { [Op.lte]: date },
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: date } },
                ]
            }
        });

        if (!series) {
            return res.status(400).json({ message: 'Inapplicable series' });
        }

        const existing = await TaskException.findOne({
            where: { seriesId, date }
        });

        const defaultDone = false;

        // If toggling back to default -> delete exception
        if (done === defaultDone) {
            if (existing) {
                await existing.destroy();
            }
            return res.status(200).json({ deleted: true });
        }

        const taskException = await TaskException.create({
            seriesId,
            date,
            done,
            userId: req.user.userId,
        });

        return res.status(200).json({ taskException });
    } catch (err) {
        console.error('Error creating task exception:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;