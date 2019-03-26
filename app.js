const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');
const app = express();

app.use(bodyParser.json());

app.use('/graphql', 
    graphqlHttp({
        schema: graphqlSchema,
        rootValue: graphqlResolvers,
        graphiql: true
}));

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clustercaio-plzwq.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
    )
    .then(() => {
        console.log("Success: Connected to MongoDB cluster!");
        app.listen(3000);
    })
    .catch(err => {
        console.log("Error: A problem ocurried in the MongoDB cluster connection!");
        throw err;
    });