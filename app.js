const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');
const app = express();

app.use(bodyParser.json());

app.use('/graphql', 
    graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                    .then(events => {
                        console.log("Success: Data retrieved!");
                        console.log(events);
                        return events.map(event => {
                            return {...event._doc};
                        });
                    })
                    .catch(err => {
                        console.log("Error: A problem ocurried to retrieve the data!");
                        throw err;
                    });
        },

        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            return event
                .save()
                .then(result => {
                    console.log("Success: Event created!");
                    console.log(result);
                    return {...result._doc};
                })
                .catch(err => {
                    console.log("Error: A problem ocurried in the event creation!");
                    throw err;
                });
            return event;
        }
    },
    graphiql: true
}));

mongoose
    .connect(
        `mongodb+srv://caioLopes:ZxCAsDQwE@clustercaio-plzwq.mongodb.net/events-app?retryWrites=true`
    )
    .then(() => {
        console.log("Success: Connected to MongoDB cluster!");
        app.listen(3000);
    })
    .catch(err => {
        console.log("Error: A problem ocurried in the MongoDB cluster connection!");
        throw err;
    });
