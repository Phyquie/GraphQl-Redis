// context.ts
import prisma from "../prisma/client";
import { ExpressContext } from "apollo-server-express";


declare module "express-session" {
    interface SessionData {
        userId?: string;
    }
}

export type Context = {
    prisma: typeof prisma;
    userId?: string;
    req: ExpressContext["req"];
};

export const createContext = ({ req }: ExpressContext): Context => {
    return {
        prisma,
        userId: req.session?.userId,
        req,
    };
};
