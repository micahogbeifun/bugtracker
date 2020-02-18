import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import "./Login.css";
import Logo from "../../components/Logo/Logo";
import { updateObject, checkValidity } from "../../shared/utility";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import Modal from "../../components/UI/Modal/Modal";
import { auth } from "../../store/actions/actions";

class Login extends Component {
  state = {
    loginForm: {
      firstname: {
        elementType: "input",
        elementConfig: {
          type: "text"
        },
        value: "",
        valueType: "firstname",
        validation: {
          required: true,
          minLength: 3,
          maxLength: 20
        },
        valid: false,
        touched: false,
        placeholder: "Your First Name"
      },
      lastname: {
        elementType: "input",
        elementConfig: {
          type: "text"
        },
        value: "",
        valueType: "lastname",
        validation: {
          required: true,
          minLength: 3,
          maxLength: 20
        },
        valid: false,
        touched: false,
        placeholder: "Your Last Name"
      },
      email: {
        elementType: "input",
        elementConfig: {
          type: "email"
        },
        value: "",
        valueType: "email",
        validation: {
          required: true,
          isEmail: true
        },
        valid: false,
        touched: false,
        placeholder: "Mail Address"
      },
      password: {
        elementType: "input",
        elementConfig: {
          type: "password"
        },
        value: "",
        valueType: "password",
        validation: {
          required: true,
          minLength: 6
        },
        valid: false,
        touched: false,
        placeholder: "Password"
      }
    },
    formIsValid: true,
    isSignup: false,
    authModal: false,
    forgotPasswordModal: false
  };

  inputChangedHandler = (event, inputIdentifier) => {
    // const namesValid = this.state.loginForm[firstname].value.split(' ').length === 1 && this.state.loginForm[lastname].value.split(' ').length === 1
    const updatedFormElement = updateObject(
      this.state.loginForm[inputIdentifier],
      {
        value: event.target.value.trim(),
        valid: checkValidity(
          event.target.value.trim(),
          this.state.loginForm[inputIdentifier].validation
        ),
        touched: true
      }
    );

    const updatedOrderForm = updateObject(this.state.loginForm, {
      [inputIdentifier]: updatedFormElement
    });
    let formIsValid = true;
    for (let inputIdentifier in updatedOrderForm) {
      if (
        !this.state.isSignup &&
        (updatedOrderForm[inputIdentifier].valueType === "firstname" ||
          updatedOrderForm[inputIdentifier].valueType === "lastname")
      ) {
        continue;
      } else {
        formIsValid = updatedOrderForm[inputIdentifier].valid && formIsValid;
      }
    }
    this.setState({ loginForm: updatedOrderForm, formIsValid });
  };

  authHandler = event => {
    event.preventDefault();
    this.props.auth(
      this.state.loginForm.email.value,
      this.state.loginForm.password.value,
      this.state.isSignup,
      this.state.loginForm.firstname.value,
      this.state.loginForm.lastname.value
    );
  };

  switchAuthMode = () => {
    this.setState(prevState => {
      return { isSignup: !prevState.isSignup };
    });
  };

  // closeAuthModal = () => {
  //   this.setState({showAuthMode: false})
  // }
  toggleAuthModal = (modal, action) => {
    this.setState({ [modal]: action });
  };

  render() {
    const formElementsArray = [];
    for (let key in this.state.loginForm) {
      if (!this.state.isSignup && (key === "firstname" || key === "lastname")) {
        continue;
      } else {
        formElementsArray.push({
          id: key,
          config: this.state.loginForm[key]
        });
      }
    }
    let form = (
      <form className="login-form" onSubmit={this.authHandler}>
        {formElementsArray.map(formElement => (
          <Input
            key={formElement.id}
            elementType={formElement.config.elementType}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            valueType={formElement.config.valueType}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            changed={event => this.inputChangedHandler(event, formElement.id)}
            placeholder={formElement.config.placeholder}
          />
        ))}
        <Button
          btnType="Success"
          disabled={!this.state.formIsValid}
          clicked={this.authHandler}
        >
          {this.state.isSignup ? "sign up" : "sign in"}
        </Button>
      </form>
    );
    let options = (
      <div className="options-div">
        <p
          className="login-option"
          style={{ display: this.state.isSignup ? "none" : "block" }}
        >
          forgot password ?
        </p>
        <p className="login-option" onClick={this.switchAuthMode}>
          {!this.state.isSignup ? "create account" : "sign in"}
        </p>
        <p
          className="login-option"
          onClick={() => this.toggleAuthModal("authModal", true)}
          style={{ display: this.state.isSignup ? "none" : "block" }}
        >
          use demo account
        </p>
      </div>
    );
    let authMode = (
      <Modal
        show={this.state.authModal}
        modalClosed={() => this.toggleAuthModal("authModal", false)}
      >
        <div className="login-modal-div">
          <div className="logo-div">
            <Logo />
          </div>
          <h1 className="login-modal-title">choose demo account</h1>
          <div
            className="login-prop-user admin"
            onClick={() =>
              this.props.auth("demo_admin_mail@mail.com", "waters")
            }
          >
            <ion-icon name="person"></ion-icon>
            <p>admin</p>
          </div>
          <div
            className="login-prop-user project-manager"
            onClick={() =>
              this.props.auth("demo_proj_man_mail@mail.com", "waters")
            }
          >
            <ion-icon name="person"></ion-icon>
            <p>project manager</p>
          </div>
          <div
            className="login-prop-user developer"
            onClick={() => this.props.auth("demo_dev_mail@mail.com", "waters")}
          >
            <ion-icon name="person"></ion-icon>
            <p>developer</p>
          </div>
          <div
            className="login-prop-user submitter"
            onClick={() => this.props.auth("demo_sub_mail@mail.com", "waters")}
          >
            <ion-icon name="person"></ion-icon>
            <p>submitter</p>
          </div>
          <div className="options-div">
            <p
              className="login-option modal"
              onClick={() => this.toggleAuthModal("authModal", false)}
            >
              cancel
            </p>
          </div>
        </div>
      </Modal>
    );
    // if (this.props.userId) {
    //   this.props.history.push("/home");
    // }
    let authRedirect = null;
    if (this.props.isAuthenticated) {
      authRedirect = <Redirect to={"/home"} />;
    }
    let errorMessage = null;
    if (
      this.props.error &&
      this.props.error.code &&
      typeof this.props.error.code === "string"
    ) {
      errorMessage = (
        <p className="error-message">
          {this.props.error.code
            .split("/")[1]
            .split("-")
            .join(" ")}
        </p>
      );
    }
    return (
      <div className="Login">
        {authRedirect}
        {authMode}
        <div className="login-div">
          <div className="logo-div">
            <Logo />
          </div>
          <h1 className="login-title">sign in</h1>
          {errorMessage}
          {form}
          {options}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.auth.userId,
    error: state.auth.error,
    isAuthenticated: state.auth.token !== null
  };
};

export default withRouter(connect(mapStateToProps, { auth })(Login));
