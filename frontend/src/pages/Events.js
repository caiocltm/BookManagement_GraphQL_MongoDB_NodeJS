import React, { Component } from 'react';
import './Events.css';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import EventList from '../components/Events/EventList/EventList';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';


class EventsPage extends Component {

    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null
    };

    isActive = true;

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    componentDidMount() {
        this.fetchEvents();
    }

    startCreateEventHandler = () => {
        this.setState({creating: true});
    };

    modalConfirmHandler = () => {
        this.setState({creating: false});
        const eventForm = {
            title: this.titleElRef.current.value, 
            price: +this.priceElRef.current.value,
            date: this.dateElRef.current.value,
            description: this.descriptionElRef.current.value
        }

        if(eventForm.title.trim().length === 0 || 
           eventForm.price <= 0 || 
           eventForm.date.trim().length === 0 || 
           eventForm.description.trim().length === 0) {
            return;
        }

        const requestBody = {
            query: 
            ` mutation {
                    createEvent(eventInput: {title: "${eventForm.title}", description: "${eventForm.description}", price: ${eventForm.price}, date: "${eventForm.date}"}) {
                        _id
                        title
                        description
                        date
                        price
                    }
                }
            `
        };

        const token = this.context.token;
            
        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            this.setState(prevState => {
                const updatedEvents = [...prevState.events];
                updatedEvents.push({
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    date: resData.data.createEvent.date,
                    price: resData.data.createEvent.price,
                    creator: {
                        _id: this.context.userId                    
                    }
                });
                return {events: updatedEvents};
            });
        }).catch(err => {
            console.log(err);
        });
    };

    modalCancelHandler = () => {
        this.setState({creating: false, selectedEvent: null});
    };

    fetchEvents() {

        this.setState({isLoading: true});

        const requestBody = {
            query: 
            ` query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            const events = resData.data.events;
            if(this.isActive) {
                this.setState({events: events, isLoading: false});
            }
        }).catch(err => {
            console.log(err);
            if(this.isActive) {
                this.setState({isLoading: false});
            }
        });
    };

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return {selectedEvent: selectedEvent};
        });
    };

    bookEventHandler = () => {

        if(!this.context.token) {
            this.setState({selectedEvent: null});
            return;
        }

        const requestBody = {
            query: 
            ` mutation {
                    bookEvent(eventId: "${this.state.selectedEvent._id}") {
                        _id
                        createdAt
                        updatedAt
                    }
                }
            `
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                 Authorization: 'Bearer ' + this.context.token
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            console.log(resData);
            this.setState({selectedEvent: null});
        }).catch(err => {
            console.log(err);
        });
    };

    componentWillUnmount() {
        this.isActive = false;
    };

    render(){

        return( 
            <React.Fragment>
            {(this.state.creating || this.state.selectedEvent) && (<Backdrop/>)}
            {this.state.creating && (
                <Modal title="Add Event" 
                canCancel 
                canConfirm 
                onCancel={this.modalCancelHandler} 
                onConfirm={this.modalConfirmHandler}
                confirmText="Confirm">

                <form>
                    <div className="form-control">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" ref={this.titleElRef}></input>
                    </div>
                    <div className="form-control">
                        <label htmlFor="price">Price</label>
                        <input type="number" id="price" ref={this.priceElRef}></input>
                    </div>
                    <div className="form-control">
                        <label htmlFor="date">Date</label>
                        <input type="datetime-local" id="date" ref={this.dateElRef}></input>
                    </div>
                    <div className="form-control">
                        <label htmlFor="description">Description</label>
                        <textarea type="text" 
                            id="description" 
                            rows="4" 
                            ref={this.descriptionElRef}>
                        </textarea>
                    </div>
                </form>
                </Modal>
            )}

            {this.state.selectedEvent && (
                <Modal title={this.state.selectedEvent.title} 
                    canCancel 
                    canConfirm 
                    onCancel={this.modalCancelHandler} 
                    onConfirm={this.bookEventHandler}
                    confirmText={this.context.token ? 'Book' : 'Confirm'}>

                    <h1>{this.state.selectedEvent.title}</h1>
                    <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
                    <p>{this.state.selectedEvent.description}</p>
                </Modal>
            )}

            {this.context.token && (
                <div className="events-control">
                    <p>Share your own Events!</p>
                    <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
                </div>
            )}

            {this.state.isLoading ? (
                <LoadingSpinner></LoadingSpinner>
                ) : 
                (<EventList 
                    events={this.state.events} 
                    authUserId={this.context.userId}
                    onViewDetail={this.showDetailHandler}>
                </EventList>)
            }

            </React.Fragment>
        );
    }
}

export default EventsPage;