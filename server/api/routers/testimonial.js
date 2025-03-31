import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/getTestimonials",async(req,res)=>{
    try {
        const getTestimonials = await prisma.testimonials.findMany({
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(getTestimonials);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
})

router.get("/getTestimonial/:id",async(req,res)=>{
    try {
        const {id} = req.params;
        const getTestimonial = await prisma.testimonials.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
        return res.status(200).json(getTestimonial);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
})

router.post("/create",async(req,res)=>{ 
    try {
        const { testimonial, userId } = req.body;
        if (!testimonial || !userId) {
            return res.status(400).json({ error: "Testimonial and user ID are required" });
        }
        const createTestimonial = await prisma.testimonials.create({
            data: {
                testimonial,
                user: { connect: { id: userId } },
            },
        });
        return res.status(201).json(createTestimonial);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
})

router.post("/upvote/:id",async(req,res)=>{
    try {
        const {id} = req.params;
        const upvote = await prisma.testimonials.update({
            where: { id },
            data: { upvotes: { increment: 1 } },
        });
        return res.status(200).json(upvote);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
})

router.post("/downvote/:id",async(req,res)=>{
    try {
        const {id} = req.params;
         
        const testimonial = await prisma.testimonials.update({
            where: { id },
            data: { downvotes: { decrement: 1 } },
        });
        if (testimonial.downvotes === 0) {
            return res.status(400).json({ error: "Downvotes cannot go below zero" });
        }
        return res.status(200).json(downvote);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
})

export default router;