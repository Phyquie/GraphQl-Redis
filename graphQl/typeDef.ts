import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    getusers: [User!]!
    userById(id: ID!): User
    me: User
  }

  type Post {
    id: ID!
    title: String!
    content: String
    published: Boolean!
    authorId: ID!
  }

  type CreateUserResponse {
    user: User!
    message: String!
    userId: ID!
  }

  type VerifyOTPResponse {
    success: Boolean!
    message: String!
    user: User
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): CreateUserResponse!
    verifyOTP(userId: ID!, otp: String!): VerifyOTPResponse!
    resendOTP(userId: ID!): VerifyOTPResponse!
    loginUser(email: String!, password: String!): User
    logout: Boolean!
    createPost(title: String!, content: String!, published: Boolean, authorId: ID!): Post
    deleteUser(id: ID!): User
    deletePost(id: ID!): Post
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
  }
`;
