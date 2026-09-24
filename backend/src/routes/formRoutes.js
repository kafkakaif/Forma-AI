import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Form routes working"
    });
});

export default router;