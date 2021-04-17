import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { Card, CardBody } from 'reactstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import { server_url, context_path, getDateToAndFrom } from '../../Common/constants';
// Calendar
import {
     Modal,
    ModalHeader,
    ModalBody
} from 'reactstrap';
// import HTML5Backend from 'react-dnd-html5-backend'
// import { DragDropContext } from 'react-dnd'
import BigCalendar from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
// import events from '../../Common/Calendar.events'
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import AddEvent from './AddEvent';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

// Setup the localizer by providing the moment
BigCalendar.momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(BigCalendar)

const localizer = BigCalendar.momentLocalizer(moment)

/* eslint jsx-a11y/anchor-has-content: "off" */
class Event extends Component {

    constructor(props) {
        super(props)
        this.state = {
            events: [],
            eventDate: new Date(),
            editSubFlag: false,
            modal: false,
            obj: {

            },
            styles: {
                'MARKET_FOLLOWUP': {
                    backgroundColor: '#f39c12',
                    borderColor: '#f39c12'
                },
                'SALES_FOLLOWUP': {
                    backgroundColor: '#0073b7',
                    borderColor: '#0073b7'
                },
                'purchases_FOLLOWUP': {
                    backgroundColor: '#00c0ef',
                    borderColor: '#00c0ef'
                },
                'COMMON': {
                    backgroundColor: '#00a65a',
                    borderColor: '#00a65a'
                }
            }
        }

        this.moveEvent = this.moveEvent.bind(this)
    }

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    cancelSave = () => {
        this.toggleModal();
    }

    moveEvent({ event, start, end }) {
        const { events } = this.state

        const idx = events.indexOf(event)
        const updatedEvent = { ...event, start, end }

        const nextEvents = [...events]
        nextEvents.splice(idx, 1, updatedEvent)

        this.setState({
            events: nextEvents,
        })

        console.log(`${event.title} was dropped onto ${event.start}`)
    }

    selectEvent = event => {
        console.log(event);
        this.setState({ subId: event.id, editSubFlag: true });
        this.toggleModal();
    };

    parseStyleProp = ({ style }) => style ? { style } : {}

    resizeEvent = (resizeType, { event, start, end }) => {
        const { events } = this.state

        const nextEvents = events.map(existingEvent => {
            return existingEvent.id === event.id
                ? { ...existingEvent, start, end }
                : existingEvent
        })

        this.setState({
            events: nextEvents,
        })

        console.log(`${event.title} was resized to ${start}-${end}`)
    }
    onSelectSlot = (e) => {

        if (e.action === 'doubleClick' || e.action === 'select') {
            this.toggleModal();
        }
    }
    componentDidMount() {
        this.loadSubObjs();
        this.setState({ loding: false })
    }

    loadSubObjs() {
        var url = server_url + context_path + "api/events?uid=" + this.props.user.id + "&" + getDateToAndFrom(moment(this.state.eventDate), 'fromTime') + "&size=100000";
        axios.get(url)
            .then(res => {
                var events = res.data._embedded.events;
                events.forEach(g => {
                    g.style = this.state.styles[g.type];
                    g.start = new Date(g.fromTime);
                    g.end = new Date(g.toTime);

                })
                this.setState({
                    events: events,
                    subPage: res.data.page
                });
            })
    }
    onNavigate(e) {
        this.setState({ eventDate: e }, this.loadSubObjs)

    }
    saveObjSuccess(id) {
        this.setState({ editSubFlag: true });
        this.toggleModal();
        this.loadSubObjs();
    }
    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <div>Calendar & Events</div>
                </div>
                { /* START row */}
                <div className="calendar-app">
                    <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'lg'} 
                    closeOnDimmerClick={false} backdrop="static">
                        <ModalHeader toggle={this.toggleModal}>
                            {this.state.editSubFlag && <span>Edit </span>}
                            {!this.state.editSubFlag && <span>Add </span>} Event
                                </ModalHeader>
                        <ModalBody>
                            <AddEvent baseUrl="events" branchId={this.state.subId} subId={this.state.obj.id} onRef={ref => (this.addTemplateRef = ref)}
                                onSave={(id) => this.saveObjSuccess(id)} onCancel={this.cancelSave}></AddEvent>
                        </ModalBody>
                    </Modal>

                    { /* START panel */}
                    <Card className="card-default">
                        <CardBody>
                            { /* START calendar */}
                            <DragAndDropCalendar
                                localizer={localizer}
                                style={{ minHeight: 500 }}
                                selectable
                                popup={true}
                                onSelectSlot={this.onSelectSlot}
                                events={this.state.events}
                                onEventDrop={this.moveEvent}
                                resizable
                                onNavigate={e => this.onNavigate(e)}
                                onEventResize={this.resizeEvent}
                                onSelectEvent={this.selectEvent}
                                defaultView="month"
                                defaultDate={new Date()}
                                eventPropGetter={this.parseStyleProp}
                            />
                            { /* END calendar */}
                        </CardBody>
                    </Card>
                    { /* END panel */}
                </div>
            </ContentWrapper>
        );
    }

}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Event);

// export default DragDropContext(HTML5Backend)(Calendar);