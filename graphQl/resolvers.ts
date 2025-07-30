import { Context } from "./context";
import bcrypt from "bcrypt";
import { protectedResolver } from "./protectedResolver";
import { sendMail, generateOTP, sendOTPEmail } from "../utils/sendMail";

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
            // Check if user already exists
            const existingUser = await context.prisma.user.findUnique({
                where: { email: args.email }
            });

            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const otp = generateOTP();

            const redisKey = `otp:${args.email}`;
            await context.redis.setEx(redisKey, 200, otp); 
            const redisKey2 = `password:${args.email}`;
            await context.redis.setEx(redisKey2, 200, args.password); // 200 seconds = 3 minutes

            try {
                await sendOTPEmail(args.email, otp, args.name);
                console.log(`📧 OTP email sent to ${args.email}`);
            } catch (error) {
                console.error('❌ Error sending OTP email:', error);
              
                throw new Error('Failed to send verification email. Please try again.');
            }

            return {
               message: 'Please check your email for verification OTP.',
            };
        },
        verifyOTP: async (_parent: unknown, args: { email: string; otp: string }, context: Context) => {
            // Get OTP from Redis
            const redisKey = `otp:${args.email}`;
            const storedOTP = await context.redis.get(redisKey);

            if (!storedOTP) {
                throw new Error('OTP has expired or is invalid');
            }

            if (storedOTP !== args.otp) {
                throw new Error('Invalid OTP');
            }

            const user = await context.prisma.user.findUnique({
                where: { email: args.email }
            });
            if(user) {
                throw new Error('User already exists');
            }
            const redisKey2 = `password:${args.email}`;
            const newuser = await context.prisma.user.create({
                data: {
                    email: args.email,
                    password: await bcrypt.hash(redisKey2, 10)
                }
            });
            await context.redis.del(redisKey);

            console.log(`✅ OTP verified for user ${args.email}`);

            return {
                success: true,
                message: 'Email verified successfully!',
                user: newuser,
             
            };  
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

            await context.prisma.post.delete({  
                where: { id: args.id }
            });

            return {
                message: 'Post deleted successfully'
            }
            
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