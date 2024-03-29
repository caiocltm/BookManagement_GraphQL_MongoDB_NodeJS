const Event = require('../../models/event');
const { transformEvent } = require('./merge');
const User = require('../../models/user');


module.exports = {
    
    events: async () => {
        try {
            const events = await Event.find();
            console.log("Success: Data retrieved!");
            return events.map(event => {
                return transformEvent(event);
            })
        } catch(err) {
            console.log("Error: A problem ocurried to retrieve the data: ", err);
            throw err;
        }
    },

    createEvent: async (args, req) => {
        
        if(!req.isAuth) throw new Error('Error: Unauthenticated user!');
       
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: args.eventInput.date,
            creator: req.userId
        });

        console.log('Event to insert');
        console.log(event);

        let createdEvents;

        try {
            const result = await event.save();
            console.log('Result do insert', result);
            createdEvents = transformEvent(result);
            const creator = await User.findById(req.userId);
            if(!creator) {
                throw new Error('User not found!');
            }
            creator.createdEvents.push(event);
            const userSaveResult = await creator.save();
            console.log('Events created');
            return createdEvents;
        } catch(err) {
            throw err;
        }
    }
};