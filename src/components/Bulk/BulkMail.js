import { Button, Card, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import axios from 'axios';
import moment from 'moment/moment.js';
import React, { Component } from 'react';
// DateTimePicker
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { connect } from 'react-redux';
import {
    CardBody, Col,

    FormGroup,
    Input,

    Modal,

    ModalBody,
    ModalFooter, ModalHeader, Table
} from 'reactstrap';
import swal from 'sweetalert';
import { context_path, server_url } from '../Common/constants';
import PageLoader from '../Common/PageLoader';
import ContentWrapper from '../Layout/ContentWrapper';




class BulkMail extends Component {
    state = {
        loading: true,
        modal: false,
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        messages: [],
        text: '',
        newObj: {
            template: '',
            type: 'T',
            forGroup: true,
            sender: 'info@mscgroup.co.in',
            group: null,
            message: '',
            to: [],
            contacts: '',
            unicode: false,
            scheduled: false,
            scheduledTime: null,
            duplicatedAllowed: false,
            flash: false
        },
        preview: {
            lis: [],
            credits: 0
        },
        languages: [{
            label: 'English',
            value: 'ENGLISH',
            code: 'en'
        }, {
            label: 'Bengali',
            value: 'BENGALI',
            code: 'bn'
        }, {
            label: 'Gujarati',
            value: 'GUJARATI',
            code: 'gu'
        }, {
            label: 'Hindi',
            value: 'HINDI',
            code: 'hi'
        }, {
            label: 'Kannada',
            value: 'KANNADA',
            code: 'kn'
        }, {
            label: 'Malayalam',
            value: 'MALAYALAM',
            code: 'ml'
        }, {
            label: 'Punjabi',
            value: 'PUNJABI',
            code: 'pa'
        }, {
            label: 'Tamil',
            value: 'TAMIL',
            code: 'ta'
        }, {
            label: 'Telugu',
            value: 'TELUGU',
            code: 'te'
        }],
        selectedLanguage: '',
        selectedSender: '',
        selectedGroup: '',
        selectedTemplate: '',
        senders: [],
        groups: [],
        templates: []
    };
    loadGroups() {
        axios.get(server_url + context_path + "api/groups?sort=creationDate,desc&sort=id,desc&uid=" + this.props.user.id)
            .then(res => {
                res.data._embedded.groups.forEach(function (dx, idx) {
                    dx.label = dx.name;
                    dx.value = dx.id;
                });

                this.setState({ groups: res.data._embedded.groups });
            })
    }

    loadTemplates() {
        axios.get(server_url + context_path + "api/templates?projection=template_details&sort=creationDate,desc&user.id=" + this.props.user.id)
            .then(res => {
                res.data._embedded.templates.forEach(function (dx, idx) {
                    dx.label = dx.name;
                    dx.value = dx.id;
                });

                this.setState({ templates: res.data._embedded.templates });
            })
    }
    handleDuplicatesChange = e => {
        var msg = this.state.newObj;
        msg.duplicatedAllowed = !msg.duplicatedAllowed;

        this.updateNewMessage(msg);
    }
    handleFlashChange = e => {
        var msg = this.state.newObj;
        msg.flash = !msg.flash;

        this.updateNewMessage(msg);
    }

    loadMessages(offset) {
        if (!offset) offset = 1;
        axios.get(server_url + context_path + "api/messages?sort=id,desc&page=" + (offset - 1) + "&uid=" + this.props.user.id)
            .then(res => {
                this.setState({
                    messages: res.data._embedded.messages,
                    page: res.data.page
                });
            })
    }

    componentDidMount() {
        //this.loadMessages();

        // this.loadGroups();
        // this.loadTemplates();

        window.location.href = 'https://login.mailchimp.com/';
    }

    submitMail = e => {
        this.setState({ loading: true });

        axios.post(server_url + context_path + "sms", this.state.newObj)
            .then(res => {
                debugger
                this.toggleModal();
                swal("Success!", "Message submitted successfully", "success");
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                swal("Unable to Send!", err.response.data.message, "error");
            });
    }

    onSubmit = e => {
        e.preventDefault();

        if (!this.state.newObj.sender) {
            swal("Unable to Send!", "Please select sender", "error");
        } else {
            this.setState({ loading: true });

            axios.post(server_url + context_path + "sms/preview", this.state.newObj)
                .then(res => {
                    console.log(res);
                    if (!res.data) {
                        res.data.lis = [];
                    }
                    this.setState({ preview: res.data }, o => { this.toggleModal() });
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    swal("Unable to Send!", err.response.data.message, "error");
                })
        }
    }

    updateNewMessage(msg) {
        this.setState({ newObj: msg });
    }

    handleTypeChange = e => {
        var msg = this.state.newObj;
        msg.type = e.target.value;

        this.updateNewMessage(msg);
    }

    handleForChange = e => {
        var msg = this.state.newObj;
        msg.forGroup = (e.target.value === "true");
        msg.group = null;
        msg.to = [];
        msg.contacts = '';

        this.updateNewMessage(msg);
    }

    handleLanguageSelect = (selectedLanguage) => {
        this.setState({ selectedLanguage });
    }

    handleSenderSelect = (e) => {
        var msg = this.state.newObj;
        msg.sender = e.target.value;

        this.updateNewMessage(msg);
    }

    handleGroupSelect = (selectedGroup) => {
        this.setState({ selectedGroup });

        var msg = this.state.newObj;
        msg.group = selectedGroup.id;

        this.updateNewMessage(msg);
    }

    handleTemplateSelect = (selectedTemplate) => {
        this.setState({ selectedTemplate });

        var msg = this.state.newObj;
        msg.message = selectedTemplate.message;
        msg.template = selectedTemplate.id;

        this.setState({ text: selectedTemplate.message });
        this.updateNewMessage(msg);
    }

    updateContacts = e => {
        var msg = this.state.newObj;
        msg.contacts = e.target.value;
        msg.to = msg.contacts.split(/\n|,/);

        this.updateNewMessage(msg);
    }

    setObjField(field, e) {
        var newObj = this.state.newObj;
        newObj[field] = e.target.value;
        this.setState({ newObj });
    }

    updateMessage = e => {
        var msg = this.state.newObj;
        var text = e.target.value;

        this.setState({ text });

        if (text.length > 0 && this.state.newObj.unicode && this.state.selectedLanguage && this.state.selectedLanguage.value !== 'ENGLISH') {
            var last = text.lastIndexOf(' ');
            if (text.lastIndexOf('}') > last) {
                last = text.lastIndexOf('}');
            }
            msg.message = msg.message.substring(0, last);

            text = text.substring(last);

            if (text.trim()) {
                axios.get(server_url + context_path + "sms/convert?text=" + encodeURI(text) + "&lang=" + this.state.selectedLanguage.code)
                    .then(res => {
                        var last1 = msg.message.lastIndexOf(' ');
                        if (msg.message.lastIndexOf('}') > last1) {
                            last1 = msg.message.lastIndexOf('}');
                        }
                        if (last1 < 0) {
                            last1 = 0;
                        }
                        if (res.data[1][0][1][0]) {
                            msg.message = msg.message.substring(0, last1 + 1) + res.data[1][0][1][0];
                        }


                        this.updateNewMessage(msg);


                    })
            } else {
                msg.message += text;
                this.updateNewMessage(msg);
            }
        } else {
            msg.message = text;
            this.updateNewMessage(msg);
        }
    }

    handleUnicodeChange = e => {
        var msg = this.state.newObj;
        msg.unicode = !msg.unicode;

        this.updateNewMessage(msg);
    }

    handleScheduledChange = e => {
        var msg = this.state.newObj;
        msg.scheduled = !msg.scheduled;

        if (msg.scheduled) {
            msg.scheduledTime = moment(new Date()).add(1, 'hours').format('MM/DD/YYYY hh:mm A');
        } else {
            msg.scheduledTime = null;
        }

        this.updateNewMessage(msg);
    }

    handleDateChange = e => {
        var msg = this.state.newObj;
        msg.scheduledTime = e.format();

        this.updateNewMessage(msg);
    }


    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        });
    }

    render() {
        // const { selectedSender } = this.state;
        const { selectedGroup } = this.state;
        // const { selectedTemplate } = this.state;
        // const { selectedLanguage } = this.state;

        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <div className="content-heading">
                    <div>
                        Bulk Mail
                    </div>
                </div>
                <div className="row d-none">
                    <div className="col-md-6 offset-md-3">
                        {/* START card */}
                        <Card className="card-default">
                            <CardBody>
                                <form className="form-horizontal" onSubmit={this.onSubmit}>
                                    <fieldset>
                                        <FormGroup row>
                                            <label className="col-md-2 col-form-label">For</label>
                                            <div className="col-md-10">
                                                <label className="c-radio">
                                                    <Input type="radio" name="group" value="true" onChange={this.handleForChange} defaultChecked />
                                                    <span className="fa fa-circle"></span>Group</label>
                                                <label className="c-radio">
                                                    <Input type="radio" name="group" value="false" onChange={this.handleForChange} />
                                                    <span className="fa fa-circle"></span>Email Ids</label>
                                            </div>
                                        </FormGroup>
                                    </fieldset>
                                    {this.state.newObj.forGroup && <fieldset>
                                        <div className="form-group row mb">
                                            <label className="col-md-2 col-form-label">Groups</label>
                                            <Col md={10}>
                                                <FormControl>
                                                    <InputLabel>Groups</InputLabel>
                                                    <Select
                                                        name="groups"
                                                        label="Select Groups..."
                                                        value={selectedGroup}
                                                        onChange={this.handleGroupSelect}
                                                    >
                                                        {this.state.groups.map((e, keyIndex) => {
                                                            return (
                                                                <MenuItem key={keyIndex} value={e.value}>{e.label}</MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Col>
                                        </div>
                                    </fieldset>}
                                    {!this.state.newObj.forGroup && <fieldset>
                                        <div className="form-group row">
                                            <label className="col-md-2 col-form-label">Contacts</label>
                                            <Col md={10}>
                                                <textarea rows="5" className="form-control" maxLength="1000"
                                                    onChange={this.updateContacts} placeholder="email ids seperated by commas(,)..." required></textarea>
                                            </Col>
                                        </div>
                                    </fieldset>}
                                    <fieldset>
                                        <div className="form-group row mb">
                                            <label className="col-md-2 col-form-label">Sender</label>
                                            <Col md={10}>
                                                <Input
                                                    name="select-name"
                                                    value={this.state.newObj.sender}
                                                    onChange={this.handleSenderSelect}

                                                    placeholder="Select Sender..."
                                                />
                                            </Col>
                                        </div>
                                    </fieldset>

                                    {/*  <fieldset>
                                        <div className="form-group row mb">
                                            <label className="col-md-2 col-form-label">Template</label>
                                            <Col md={10}>
                                                <Select
                                                    name="select-name"
                                                    value={selectedTemplate}
                                                    onChange={this.handleTemplateSelect}
                                                    options={this.state.templates}
                                                    placeholder="Select Template..."
                                                />
                                            </Col>
                                        </div>
                                    </fieldset>*/}

                                    <fieldset>
                                        <div className="form-group row">
                                            <label className="col-md-2 col-form-label">Body</label>
                                            <Col md={10}>
                                                <textarea
                                                    rows={5}
                                                    maxChars={10000}
                                                    maxLength={10000}
                                                    onChange={this.updateMessage}
                                                    className="form-control"
                                                    value={this.state.newObj.message}
                                                    placeholder="Enter mail here..."></textarea>
                                            </Col>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <FormGroup row>
                                            <label className="col-md-3 col-form-label">Allow Duplicates</label>
                                            <div className="col-md-9">
                                                <label className="switch switch-lg">
                                                    <input type="checkbox" onChange={this.handleDuplicatesChange} />
                                                    <span></span>
                                                </label>
                                            </div>
                                        </FormGroup>
                                    </fieldset>
                                    <fieldset>
                                        <FormGroup row>
                                            <label className="col-md-3 col-form-label">Schedule</label>
                                            <div className="col-md-3">
                                                <label className="switch switch-lg">
                                                    <input type="checkbox" onChange={this.handleScheduledChange} />
                                                    <span></span>
                                                </label>
                                            </div>
                                            {this.state.newObj.scheduled && <div className="col-md-4">
                                                <Datetime inputProps={{ className: 'form-control' }} onChange={this.handleDateChange} defaultValue={this.state.newObj.scheduledTime} />
                                            </div>}
                                        </FormGroup>
                                    </fieldset>


                                    <div className="form-group row">
                                        <div className="col-sm-4 col-sm-offset-2">
                                            <Button variant="contained" color="primary" type="submit" className="btn btn-raised btn-primary">Preview Mail</Button>
                                        </div>
                                    </div>
                                </form>

                                <Modal isOpen={this.state.modal} toggle={this.toggleModal} size={'lg'}>
                                    <ModalHeader toggle={this.toggleModal}>Preview Messages (Total Credits : {this.state.preview.credits})</ModalHeader>
                                    <ModalBody>
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Message</th>
                                                    <th>Sender</th>
                                                    <th>Contact</th>
                                                    <th>Credits</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.preview.lis.map((msg, i) => {
                                                    return (
                                                        <tr key={msg.id}>
                                                            <td>{i + 1}</td>
                                                            <td>{msg.message}</td>
                                                            <td>{msg.sender}</td>
                                                            <td>{msg.numbers}</td>
                                                            <td>{msg.credits}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>
                                    </ModalBody>
                                    <ModalFooter>
                                        <div className="text-center">
                                            <Button variant="contained" color="primary" className="btn btn-raised btn-primary" onClick={this.submitMail}>Send Mail</Button>
                                        </div>
                                    </ModalFooter>
                                </Modal>

                            </CardBody>
                        </Card>
                        {/* END card */}
                    </div>
                </div>
            </ContentWrapper>
        );
    }

}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(BulkMail);
