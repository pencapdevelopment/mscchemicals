import React from 'react';
import PageLoader from '../Common/PageLoader';
import ContentWrapper from '../Layout/ContentWrapper';
import { connect } from 'react-redux';
import axios from 'axios';
import swal from 'sweetalert';
import Moment from 'react-moment';
import CustomPagination from '../Common/CustomPagination';
import {
    Col,
    Card,
    CardBody,
    Table,
    Input
} from 'reactstrap';

import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import CKEditor from 'ckeditor4-react';

import $ from 'jquery';
import { server_url, context_path } from '../Common/constants';

import { Button} from '@material-ui/core';


class Blog extends React.Component {
    state = {
        loading: false,
        activeTab: 'posts',
        page1: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        page2: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        posts: [],
        filters: {
            search1: '',
            search2: ''
        },
        urlError: '',
        tags: [],
        tempTag: '',
        comments: [],
        newPost: {
            id: 0,
            title: '',
            content: '',
            deleteImage: false,
            popular: false,

            url: '',
            active: 1,
            image: '',
        },
        commentPost: ''
    }

    componentDidMount() {
        this.loadPosts();


        $('body').on('click', function () {
            $('#ui-menu').hide();
        });
    }

    checkDuplicate(url) {
        if (url.trim().length === 0) {
            return;
        }
        var url1 = server_url + context_path + "api/blog?projection=post_summary&url=" + url;

        axios.get(url1).then((res) => {
            var len = res.data._embedded.blogs.length;
            if ((len > 0 && !this.state.editFlag) || (len > 1 && this.state.editFlag)) {
                this.setState({ urlError: 'url already used' });
            } else {
                this.setState({ urlError: '' });
            }
        })
    }

    loadPosts(offset) {
        if (!offset) offset = 1;

        var url = server_url + context_path + "api/blog?projection=post_summary&sort=id,desc&page=" + (offset - 1);

        if (this.state.filters.search1) {
            url += "&title=" + encodeURIComponent('%' + this.state.filters.search1 + '%');
        }

        axios.get(url)
            .then(res => {
                this.setState({
                    posts: res.data._embedded.blogs,
                    page1: res.data.page
                }, o => function () { this.toggleTab('posts'); this.resetPost(); });
            })
    }

    loadPostComments(idx) {
        this.setState({ commentPost: idx }, o => { this.loadComments() });
    }

    loadComments(offset) {
        if (!offset) offset = 1;
        var post = this.state.posts[this.state.commentPost];

        var url = server_url + context_path + "api/comments?projection=comment_all&blog=" + post.id + "&sort=id,desc&page=" + (offset - 1);

        if (this.state.filters.search2) {
            url += "&comment=" + encodeURIComponent('%' + this.state.filters.search2 + '%');
        }

        axios.get(url)
            .then(res => {
                this.setState({
                    comments: res.data._embedded.comments,
                    page2: res.data.page
                });

                this.toggleTab('comments')
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                swal("No comments available!", "", "error");
            })
    }

    searchPost = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search1 = str;
        this.setState({ filters }, o => { this.loadPosts() });
    }

    searchComments = e => {
        var str = e.target.value;
        var filters = this.state.filters;

        filters.search2 = str;
        this.setState({ filters }, o => { this.loadComments() });
    }

    toggleTab = (tab) => {
        console.log(this.refs.ckedit.editor);
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }

        this.refs.ckedit.editor.on('fileUploadRequest', function (evt) {
            console.log('fileUploadReuqest');
            var fileLoader = evt.data.fileLoader,
                formData = new FormData(),
                xhr = fileLoader.xhr;


            var itm = JSON.parse(localStorage.getItem("designbricks-store-key"));

            xhr.open('POST', server_url + context_path + 'blog/images', true);
            xhr.setRequestHeader("Authorization", 'Bearer ' + itm.login.userObj.token);
            formData.append('upload', fileLoader.file, fileLoader.fileName);
            fileLoader.xhr.send(formData);

            // Prevented the default behavior.
            evt.stop();
        }, null, null, 4);

    }




    onEditorStateChange = data => {
        let newPost = this.state.newPost;
        newPost.content = data
        this.setState({ newPost });
    }

    addPost() {
        this.setState({ editFlag: false })
        this.resetPost();
        this.toggleTab('add');
    }


    onSubmit = e => {
        e.preventDefault();

        var url = server_url + context_path + "api/blog/";

        var newPost = this.state.newPost;

        if (!newPost.title || newPost.title === '') {
            swal("Unable to Edit!", 'Please enter title', "error");
            return;
        }

        if (!newPost.url || newPost.url === '') {
            swal("Unable to Edit!", 'Please enter url', "error");
            return;
        }

        if (!newPost.content || newPost.content === '') {
            swal("Unable to Edit!", 'Please enter content', "error");
            return;
        }

        if ((!this.state.editFlag && !newPost.image) || (this.state.editFlag && newPost.deleteImage)) {
            swal("Unable to Edit!", 'Please upload image', "error");
            return;
        }

        this.setState({ loading: true });

        if (this.state.editFlag) {
            url += this.state.newPost.id;

            var obj = {
                title: newPost.title,
                popular: newPost.popular,
                content: newPost.content,

                url: newPost.url,
                image: newPost.image
            };

            axios.patch(url, obj)
                .then(res => {
                    this.toggleTab('posts');

                    if (res.status === 200) {
                        swal("Success!", "Successfully updated", "success");
                        this.loadPosts();
                    } else {
                        this.setState({ addError: res.response.data.globalErrors[0] });
                        swal("Unable to Edit!", res.response.data.globalErrors[0], "error");
                    }
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    this.toggleTab('posts');
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Edit!", err.response.data.globalErrors[0], "error");
                })
        } else {
            newPost.id = undefined;
            newPost.createdBy = this.props.user.id;

            axios.post(url, newPost)
                .then(res => {
                    this.loadPosts();
                    this.toggleTab('posts');
                }).finally(() => {
                    this.setState({ loading: false });
                }).catch(err => {
                    // this.toggleTab('posts');
                    this.setState({ addError: err.response.data.globalErrors[0] });
                    swal("Unable to Add!", err.response.data.globalErrors[0], "error");
                })
        }

    }

    updateNewPost(field, e) {
        var post = this.state.newPost;
        if (field === 'url') {
            post[field] = e.target.value.split(" ").join("-").replace(/[^0-9a-zA-Z_-]/g, '').toLowerCase();
            this.checkDuplicate(post[field])
        } else {
            post[field] = e.target.value;
        }
        this.setState({ newPost: post });
        this.setState({ newPost: post });
    }

    editPost = (i) => {
        var post = this.state.posts[i];

        axios.get(server_url + context_path + "api/blog/" + post.id)
            .then(res => {
                this.setState({ newPost: res.data, editFlag: true });
                this.toggleTab('add');
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    resetPost() {
        var newPost = {
            id: 0,
            title: '',
            content: '',
            deleteImage: false,
            popular: false,
            videoUrl: '',
            url: '',
            active: 1,
            image: '',
        };

        this.setState({ newPost });
    }

    deleteImageItem() {
        let newPost = this.state.newPost;
        newPost.deleteImage = true;
        newPost.image = '';
        this.setState({ newPost });
    }

    openUrl = (url, e) => {
        e.preventDefault();
        window.open("https://www.mscgroup.co.in//blog/" + url);
        return false;
    }

    createImageItem = () => (
        <Col md={3} >
            <a href="#s"  onClick={o => this.deleteImageItem()}>
                {this.state.newPost.image !== undefined && this.state.newPost.image.trim().length > 0 &&
                    <img className="img-fluid mb-2" alt="error" src={this.state.newPost.image} />
                }
                {this.state.newPost !== undefined && this.state.newPost.id !== undefined && this.state.newPost.id > 0 && !this.state.newPost.deleteImage &&
                    <img className="img-fluid mb-2" alt="error" src={`bp-api/blog/images/${this.state.newPost.id}.jpg`} />
                }
            </a>
        </Col>
    )

    updatePopular = e => {
        let newPost = this.state.newPost;
        newPost.popular = !(newPost.popular);

        this.setState({ newPost });
    }

    fileChange(e) {
        let newPost = this.state.newPost;
        var reader = new FileReader();
        var file = e.target.files[0];
        reader.onload = () => {
            newPost.image = reader.result;
            this.setState({ newPost });
        }

        reader.readAsDataURL(file);
        e.target.value = null;
    }


    patchPost(idx) {
        var post = this.state.posts[idx];

        axios.patch(server_url + context_path + "blog/" + post.id)
            .then(res => {
                // this.state.posts[idx].active = !this.state.posts[idx].active;
                this.setState({ posts: this.state.posts });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                this.setState({ patchError: err.response.data.globalErrors[0] });
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    patchComment(idx) {
        var post = this.state.posts[this.state.commentPost];
        var comment = this.state.comments[idx];

        axios.patch(server_url + context_path + "blog/" + post.id + "/comments/" + comment.id)
            .then(res => {
                // this.state.comments[idx].active = !this.state.comments[idx].active;
                this.setState({ comments: this.state.comments });
            }).finally(() => {
                this.setState({ loading: false });
            }).catch(err => {
                swal("Unable to Patch!", err.response.data.globalErrors[0], "error");
            })
    }

    onInitEditor(editor) {

    }

    render() {
        // var itm = JSON.parse(localStorage.getItem("designbricks-store-key"));

        const ckCSS = '.ck.ck-editor__editable { min-height: 200px;}';
        const autoCSS = '.ui-widget.ui-widget-content{z-index:100;position:absolute;cursor:default;list-style:none;padding:0;margin:0;outline:0;font-family:Arial,Helvetica,sans-serif;font-size:1em;background:#fff;color:#333;max-height:300px;width:inherit;overflow-x:hidden;overflow-y:auto;border:1px solid #c5c5c5}.ui-menu .ui-menu-item{margin:0;cursor:pointer;list-style-image:url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)}.ui-menu .ui-menu-item-wrapper{position:relative;padding:3px 1em 3px .4em}';

        return (
            <ContentWrapper>
                {this.state.loading && <PageLoader />}
                <style>{ckCSS}</style>
                <style>{autoCSS}</style>

                <div className="content-heading">
                    <div>Blog</div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <Nav tabs>
                            <NavItem>
                                <NavLink className={this.state.activeTab === 'posts' ? 'active' : ''}
                                    onClick={() => { this.toggleTab('posts'); }}>List</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={this.state.activeTab === 'add' ? 'active' : ''}
                                    onClick={() => { this.addPost(); }}
                                >Add {this.state.roleName}</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={this.state.activeTab === 'comments' ? 'active' : ''}
                                    onClick={() => { }}
                                >Comments {this.state.roleName}</NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab} className="bg-white p-0">
                            <TabPane tabId="posts">
                                <Card className="card-default">
                                    <div className="card-header">
                                        <div className="row">
                                            <div className="col-md-2 offset-md-4">
                                                <h4 className="float-right">Filters : </h4>
                                            </div>
                                            <div className="col-md-4">
                                                <Input type="text" onChange={this.searchPost} value={this.state.filters.search1} placeholder="search posts..." />
                                            </div>

                                        </div>
                                    </div>
                                    <CardBody>
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Title</th>
                                                    <th>Url</th>
                                                    <th>Hits</th>
                                                    <th>State</th>
                                                    <th>Created On</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.posts.map((post, i) => {
                                                    return (
                                                        <tr key={post.id}>
                                                            <td>{i + 1}</td>
                                                            <td>
                                                                {/* <Link to={`/blog/${post.id}`}>
                                                                    {post.title}
                                                                </Link> */}
                                                                <Button className="btn-link" onClick={() => this.editPost(i)}>{post.title}</Button>
                                                            </td>
                                                            <td>
                                                                <a className="btn-link" onClick={(e) => this.openUrl(post.url, e)} href="#s" >{post.url}</a>
                                                            </td>
                                                            <td>
                                                                {post.hits}
                                                            </td>
                                                            <td>
                                                                {post.active &&
                                                                    <span className="badge badge-green">active</span>
                                                                }
                                                                {!post.active &&
                                                                    <span className="badge badge-danger">inactive</span>
                                                                }
                                                            </td>
                                                            <td>
                                                                <Moment format="DD MMM YY HH:mm">{post.creationDate}</Moment>
                                                            </td>
                                                            <td>
                                                                <Button variant="contained" color="inverse" size="xs" onClick={() => this.editPost(i)}>Edit</Button>
                                                                <Button variant="contained" color="warning" size="xs" onClick={() => this.patchPost(i)}>{post.active ? 'InActivate' : 'Activate'}</Button>

                                                                <Button variant="contained" color="warning" size="xs" onClick={() => this.loadPostComments(i)}>Comments</Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>

                                        <CustomPagination page={this.state.page1} onChange={(x) => this.loadPosts(x)} />
                                    </CardBody>
                                </Card>
                            </TabPane>
                            <TabPane tabId="add">
                                <Card className="card-default">
                                    <CardBody>
                                        <form className="form-horizontal" onSubmit={this.onSubmit}>
                                            <div className="col-md-12">
                                                <fieldset>
                                                    <div className="form-group row mb">
                                                        <label className="col-md-4 col-form-label text-right">Title *</label>
                                                        <Col md={6}>
                                                            <Input type="text" onChange={e => this.updateNewPost('title', e)} minLength="5" maxLength="500" value={this.state.newPost.title} required />
                                                        </Col>
                                                    </div>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="form-group row mb ">
                                                        <label className="col-md-4 col-form-label text-right"> Popular </label>
                                                        <Col md={6}>
                                                            <div className="checkbox c-checkbox">
                                                                <label className="mb-1">
                                                                    <Input type="checkbox" checked={this.state.newPost.popular} onChange={e => this.updatePopular(e)} value={this.state.newPost.popular} />
                                                                    <span className="fa fa-check"></span>
                                                                </label>
                                                            </div>
                                                        </Col>
                                                    </div>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="form-group row mb">
                                                        <label className="col-md-4 col-form-label text-right">Url *</label>
                                                        <Col md={6}>
                                                            <Input type="text" invalid={this.state.urlError.length > 0} onChange={e => this.updateNewPost('url', e)} minLength="5" maxLength="500" value={this.state.newPost.url} required />
                                                            <span className="text-info"> {'https://www.mscgroup.co.in//blog/' + this.state.newPost.url.split(' ').join('-')}</span>
                                                            <span className="invalid-feedback">{this.state.urlError}</span>
                                                        </Col>

                                                    </div>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="form-group row mb">
                                                        <label className="col-md-4 col-form-label text-right">Image *</label>
                                                        <Col md={6}>
                                                            <Input type="file" accept="image/*" onChange={e => this.fileChange(e)} />
                                                            <div className="mt-3">
                                                                {this.createImageItem()}
                                                            </div>
                                                        </Col>
                                                    </div>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="form-group row mb">
                                                        <label className="col-md-4 col-form-label text-right">Content *</label>
                                                        <Col md={8}>
                                                            <CKEditor
                                                                type="classic"
                                                                ref="ckedit"
                                                                config={{

                                                                    filebrowserUploadUrl: server_url + context_path + '/blog/images',
                                                                    toolbar: [{
                                                                        name: 'paste',
                                                                        items: ['PasteFromWord']
                                                                    }, {
                                                                        name: 'styles',
                                                                        items: ['Format', 'Font', 'FontSize']
                                                                    }, {
                                                                        name: 'basicstyles',
                                                                        items: ['Bold', 'Italic', 'Underline', 'CopyFormatting', 'RemoveFormat', '-', 'TextColor', 'BGColor', '-', 'NumberedList', 'BulletedList', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight',]
                                                                    }, {
                                                                        name: 'links',
                                                                        items: ['Link', 'Unlink', '-']
                                                                    }, {
                                                                        name: 'presentation',
                                                                        items: ['Table', 'Mathjax', 'EqnEditor', 'SpecialChar']
                                                                    }, {
                                                                        name: 'insert',
                                                                        items: ['Image', 'Chart', 'Table', 'Smiley', 'Iframe', 'Youtube']
                                                                    }, {
                                                                        name: 'tools',
                                                                        items: ['Maximize', 'Source']
                                                                    }]
                                                                }}
                                                                height={500}
                                                                data={this.state.newPost.content}
                                                                onChange={(event) => {
                                                                    this.onEditorStateChange(event.editor.getData());
                                                                }}

                                                            />
                                                            <br />
                                                        </Col>
                                                    </div>
                                                </fieldset>

                                                <fieldset>
                                                    <div className="form-group row">
                                                        <div className="col-12 text-center mt-3">
                                                            <button type="submit" className="btn btn-raised btn-primary">Save</button>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </form>
                                    </CardBody>
                                </Card>
                            </TabPane>

                            <TabPane tabId="comments">
                                <Card className="card-default">
                                    <div className="card-header">
                                        <div className="row">
                                            <div className="col-md-2 offset-md-4">
                                                <h4 className="float-right">Filters : </h4>
                                            </div>
                                            <div className="col-md-4">
                                                <Input type="text" onChange={this.searchComments} value={this.state.filters.search2} placeholder="search comments..." />
                                            </div>

                                        </div>
                                    </div>
                                    <CardBody>
                                        <Table hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Comment</th>
                                                    <th>State</th>
                                                    <th>Created On</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.comments.map((comment, i) => {
                                                    return (
                                                        <tr key={comment.id}>
                                                            <td>{i + 1}</td>
                                                            <td>
                                                                {comment.name}
                                                            </td>
                                                            <td>
                                                                {comment.comment}
                                                            </td>
                                                            <td>
                                                                {comment.active &&
                                                                    <span className="badge badge-green">active</span>
                                                                }
                                                                {!comment.active &&
                                                                    <span className="badge badge-danger">inactive</span>
                                                                }
                                                            </td>
                                                            <td>
                                                                <Moment format="DD MMM YY HH:mm">{comment.creationDate}</Moment>
                                                            </td>
                                                            <td>
                                                                <Button variant="contained" color="warning" size="xs" onClick={() => this.patchComment(i)}>{comment.active ? 'InActivate' : 'Activate'}</Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>

                                        <CustomPagination page={this.state.page2} onChange={(x) => this.loadComments(x)} />
                                    </CardBody>
                                </Card>
                            </TabPane>
                        </TabContent>
                    </div>
                </div>
            </ContentWrapper>
        );
    }
}

const mapStateToProps = state => ({ settings: state.settings, user: state.login.userObj })

export default connect(
    mapStateToProps
)(Blog);

