// context.ts
import prisma from "../prisma/client";
import { ExpressContext } from "apollo-server-express";
import { RedisClientType } from "redis";

declare module "express-session" {
    interface SessionData {
        userId?: string;
    }
}

export type Context = {
    prisma: typeof prisma;
    userId?: string;
    req: ExpressContext["req"];
    redis: any; // Using any to avoid type conflicts
};

export const createContext = ({ req, redis }: ExpressContext & { redis: any }): Context => {
    return {
        prisma,
        userId: req.session?.userId,
        req,
        redis,
    };
};
