const Event = require('../../models/event');
const { transformEvent } = require('./merge');


module.exports = {
    
    events: async () => {
        try {
            const events = await Event.find()
            console.log("Success: Data retrieved!");
            return events.map(event => {
                return transformEvent(event);
            })
        } catch(err) {
            console.log("Error: A problem ocurried to retrieve the data!");
            throw err;
        }
    },

    createEvent: async (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: dateToString(args.eventInput.date),
                creator: '5c83bf26e66cd72b0894b8ae'
            });

            let createdEvents;

        try {
            const result = await event.save()
            createdEvents = transformEvent(result);
            const creator = await User.findById('5c83bf26e66cd72b0894b8ae');
            if(!creator) {
                throw new Error('User not found!');
            }
            creator.createdEvents.push(event);
            const userSaveResult = await creator.save();
            return createdEvents;
        } catch(err) {
            throw err;
        }
    }
};