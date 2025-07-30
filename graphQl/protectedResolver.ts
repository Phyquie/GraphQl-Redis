import prisma from '../prisma/client';
export const protectedResolver = async (_: any, __: any, context: any) => {
    if (!context.userId) {

        throw new Error('Not authenticated');
    }
    

    const user = await prisma.user.findUnique({
        where: { id: context.userId },
    });

    return user;
};
