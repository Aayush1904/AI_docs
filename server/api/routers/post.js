import express from "express";
const router = express.Router();

// Example Post Route
router.get("/", (req, res) => {
  res.json({ message: "Posts API working!" });
});

export default router;
