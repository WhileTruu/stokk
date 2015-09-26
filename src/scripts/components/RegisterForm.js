import React, {Component} from 'react';

class RegisterForm extends Component {
  static MINIMUM_PASSWORD_LENGTH = 8;

  constructor(props) {
    super(props);
    this.state = {
      isEmailValid: true,
      arePasswordsValid: true,
      errorMessage: '',
    };
  }

  onSubmit(event) {
    event.preventDefault();
    const email = this.refs.email.value.trim();
    const passwordOnce = this.refs.passwordOnce.value;
    const passwordTwice = this.refs.passwordTwice.value;

    const valids = {
      email: true,
      passwords: true,
    };

    const errorMessages = [];

    if (email.length === 0) {
      valids.email = false;
      errorMessages.push('Please input an email.');
    }

    if (passwordOnce.length < RegisterForm.MINIMUM_PASSWORD_LENGTH) {
      valids.passwords = false;
      errorMessages.push('Please input a password of at least 8 characters.');
    }

    if (passwordOnce !== passwordTwice) {
      valids.passwords = false;
      errorMessages.push('Passwords don\'t match.');
    }

    if (errorMessages.length) {
      this.setState({
        isEmailValid: valids.email,
        arePasswordsValid: valids.passwords,
        errorMessage: errorMessages.shift(),
      });
    } else {
      // register
      this.setState({
        isEmailValid: true,
        arePasswordsValid: true,
        errorMessage: '',
      });
    }
  }

  render() {
    const {isEmailValid, arePasswordsValid, errorMessage} = this.state;
    const errorNode = (
      <div className="alert alert-danger">
        {errorMessage}
      </div>
    );
    return (
      <div className="register-form-container">
        <div className="stokk-card">
          <h4 className="card-title">Register</h4>
          <form onSubmit={this.onSubmit.bind(this)}>
            <div className={'form-group' + (isEmailValid ? '' : ' has-error')}>
              <input
                type="email"
                ref="email"
                className="form-control"
                placeholder="email" />
            </div>

            <div className={'form-group' + (arePasswordsValid ? '' : ' has-error')}>
              <input
                type="password"
                ref="passwordOnce"
                className="form-control"
                placeholder="password" />
            </div>

            <div className={'form-group' + (arePasswordsValid ? '' : ' has-error')}>
              <input
                type="password"
                ref="passwordTwice"
                className="form-control"
                placeholder="password again" />
            </div>

            {errorMessage ? errorNode : ''}

            <div className="form-group">
              <input
                type="submit"
                value="Submit"
                className="btn btn-primary btn-block" />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default RegisterForm;
