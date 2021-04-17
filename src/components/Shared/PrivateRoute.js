import React from 'react'
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom'
// import Menu from '../../Menu';
const PrivateRoute = ({ component: Component, ...rest }) => {

   
  const isLoggedIn = rest.loginStatus.login;
  
  const isAvailable= (props) =>{
    // console.log("props ",props)
    return true;
  }
  
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? isAvailable(props)?(
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/dashboard', state: { from: props.location } }} />
        ): (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  )
}

const mapStateToProps = state => ({ loginStatus: state.login , user: state.login.userObj})


export default connect(
  mapStateToProps
)(PrivateRoute);