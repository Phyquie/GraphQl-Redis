import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    getusers: [User!]!
    userById(id: ID!): User
  }

  type Post {
    id: ID!
    title: String!
    content: String
    published: Boolean!
    authorId: ID!
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User
    loginUser(email: String!, password: String!): User
    logout: Boolean
    createPost(title: String!, content: String!, published: Boolean, authorId: ID!): Post
    deleteUser(id: ID!): User
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
  }
`;
