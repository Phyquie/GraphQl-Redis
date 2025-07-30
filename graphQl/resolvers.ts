import { Context } from "./context";
import bcrypt from "bcrypt";
import { protectedResolver } from "./protectedResolver";

export const resolvers = {
    Query: {
        // Define your query resolvers here
        getusers: async (_parent: unknown, _args: unknown, context: Context) => {
            const user = await protectedResolver(_parent, _args, context);
            if (!user) {
                throw new Error('Not authenticated');
            }
            // Fetch all users from the database
            return context.prisma.user.findMany();
        },
        userById: async (_parent: unknown, args: { id: string }, context: Context) => {
            return context.prisma.user.findUnique({
                where: { id: args.id }
            });
        },
        me: async (_parent: unknown, _args: unknown, context: Context) => {
            return context.prisma.user.findUnique({
                where: { id: context.userId }
            });
        }
    },
    Mutation: {
        createUser: async (_parent: unknown, args: { name: string; email: string; password: string }, context: Context) => {
            return context.prisma.user.create({
                data: {
                    name: args.name,
                    email: args.email,
                    password: await bcrypt.hash(args.password, 10)
                }
            });
        },
        createPost: async (_parent: unknown, args: { title: string; content: string; published: boolean; authorId: string }, context: Context) => {
            return context.prisma.post.create({
                data: {
                    title: args.title,
                    content: args.content,
                    published: args.published,
                    author: { connect: { id: args.authorId } }
                }
            });
        },
        deleteUser: async (_parent: unknown, args: { id: string }, context: Context) => {
            return context.prisma.user.delete({
                where: { id: args.id }
            });
        },
        deletePost: async (_parent: unknown, args: { id: string }, context: Context) => {

            if(!context.userId) {
                throw new Error('Not authenticated');
            }

            const post = await context.prisma.post.findUnique({
                where: { id: args.id }
            });

            if(!post) {
                throw new Error('Post not found');
            }

            if(post.authorId !== context.userId) {
                throw new Error('You are not the author of this post');
            }

            return context.prisma.post.delete({
                where: { id: args.id }
            });
        },

        loginUser: async (_parent: unknown, args: { email: string; password: string }, context: Context) => {
            const user = await context.prisma.user.findUnique({
                where: { email: args.email }
            });

            if (!user?.email) {
                throw new Error('User not found');
            }

            if (!user.password) {
                throw new Error('User not found');
            }

            const isValid = await bcrypt.compare(args.password, user.password);
            if (!isValid) {
                throw new Error('Invalid password');
            }

           
            
            context.req.session.userId = user.id;
            
            console.log(context.req.session)
            
        
            console.log('🔐 Login successful:', {
                userId: user.id,
                sessionId: context.req.sessionID,
                sessionData: context.req.session
            });
            
            return user;
        },

        logout: async (_parent: unknown, _args: unknown, context: Context) => {
            context.req.session.destroy((err) => {
                if (err) {
                    console.error('❌ Error destroying session:', err);
                }
            });
            return true;
        }       
    },

    // Add other resolver types as needed
};