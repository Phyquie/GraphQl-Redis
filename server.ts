import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphQl/typeDef";
import { resolvers } from "./graphQl/resolvers";
import session from "express-session";
import { createContext } from "./graphQl/context";
import cookieParser from "cookie-parser";
import { RedisStore } from 'connect-redis';
import { createClient } from "redis";
import cors from "cors";




async function startServer() {
    const app = express();
    app.use(cookieParser());
    app.use(cors({
        origin: "https://studio.apollographql.com", 
        credentials: true, 
      }));

    const redisClient = createClient({
        url: "redis://:YPCHpG61LuCdFuHQGCHEk8w6lgxsiQ9e@redis-10218.c14.us-east-1-2.ec2.redns.redis-cloud.com:10218"
    });
    redisClient.on('connect', () => {
        console.log('✅ Connected to Redis');
    });
    redisClient.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
    });
    redisClient.on('ready', () => {
        console.log('✅ Redis is ready');
    });
    await redisClient.connect();
    

    app.use(
        session({
            store: new RedisStore({ client: redisClient }),
            name: 'qid',
            secret: '1234567890abcdef',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                maxAge: 1000 * 60 * 60,
                sameSite: 'none'
            },
        })
    );

    // Test endpoint to check Redis sessions
    app.get('/test-sessions', async (req, res) => {
        try {
            // Get all session keys from Redis
            const sessionKeys = await redisClient.keys('sess:*');
            const sessions = [];
            
            for (const key of sessionKeys) {
                const sessionData = await redisClient.get(key);
                if (sessionData) {
                    try {
                        const parsed = JSON.parse(sessionData);
                        sessions.push({
                            key,
                            userId: parsed.userId || 'No userId',
                            cookie: parsed.cookie,
                            createdAt: new Date(parsed.cookie?.expires || Date.now())
                        });
                    } catch (e) {
                        sessions.push({
                            key,
                            data: sessionData,
                            error: 'Could not parse session data'
                        });
                    }
                }
            }
            
            res.json({
                totalSessions: sessionKeys.length,
                sessions,
                currentSessionId: req.sessionID,
                currentUserId: req.session?.userId || 'No userId in current session'
            });
        } catch (error) {
            res.status(500).json({ error: (error instanceof Error ? error.message : error) });
        }
    });

    // Test endpoint to create a test session
    app.get('/create-test-session', (req, res) => {
        req.session.userId = 'test-user-' + Date.now();
        req.session.save((err) => {
            if (err) {
                res.json({ error: err.message });
            } else {
                res.json({ 
                    message: 'Test session created',
                    sessionId: req.sessionID,
                    userId: req.session.userId
                });
            }
        });
    });

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }) => createContext({ req, res }),
    });

    await server.start();
    server.applyMiddleware({ app ,
        cors: false
    }
    );

    app.listen({ port: 4000 }, () => {
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
        console.log(`📊 Test sessions at http://localhost:4000/test-sessions`);
        console.log(`🔧 Create test session at http://localhost:4000/create-test-session`);
    });
}

startServer();
