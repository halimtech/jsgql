const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
const {Pool} = require('pg')

// configure db
const pool =  new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS
})


// Create a schema and a root resolver:
const schema = buildSchema(`
    type Book {
        title: String!
        author: String!
    }

    type Query {
        books: [Book]
    }
`);

const resolvers = {
    Query: {
      books: async () => {
        const client = await pool.connect();
        try {
          const result = await client.query("SELECT * FROM books");
          return result.rows;
        } finally {
          client.release();
        }
      },
    },
  };

var app = express()
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
  })
)
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")