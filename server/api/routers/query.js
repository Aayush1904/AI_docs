import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/create",async(req,res)=>{
    try {
        const { query, userId } = req.body;
        if (!query || !userId) {
            return res.status(400).json({ error: "Query and user ID are required" });
        }
        const queryData = await prisma.queries.create({
            data: {
                query,
                user: { connect: { id: userId } },
            },
        });
        return res.status(201).json(queryData);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
})

router.get("/getQueries",async(req,res)=>{
    try {
        const {userId} = req.params;
        const queries = await prisma.queries.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(queries);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
})

export default router;