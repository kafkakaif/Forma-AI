import { Router } from "express";
import { Submission } from "../models/Submission.js";

const router = Router();

// -----------------------------------------
// GET ALL SUBMISSIONS
// -----------------------------------------

router.get("/", async (_req, res, next) => {
  try {
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// GET ONE SUBMISSION
// -----------------------------------------

router.get("/:id", async (req, res, next) => {
  try {
    const submission = await Submission.findById(
      req.params.id
    ).lean();

    if (!submission) {
      return res.status(404).json({
        error: "Submission not found",
      });
    }

    res.json(submission);
  } catch (err) {
    next(err);
  }
});

export default router;