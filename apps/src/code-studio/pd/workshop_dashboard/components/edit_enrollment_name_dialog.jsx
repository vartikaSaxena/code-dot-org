import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'react-bootstrap';
import _ from 'lodash';

export default class EditEnrollmentNameDialog extends React.Component {
  static propTypes = {
    selectedEnrollment: PropTypes.object,
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onMove: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      firstName: null,
      lastName: null
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClickUpdate = this.handleClickUpdate.bind(this);
  }

  handleInputChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  // use enrollment ID here
  handleClickUpdate() {
    this.props.onMove(_.pick(this.state, ['firstName', 'lastName']));
  }

// need to add default values
// defaultValue={this.props.selectedEnrollment.first_name}
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Enrollee Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>
              First name:{' '}
              <input type="text" name="firstName" onChange={this.handleInputChange} />
            </label>
            <label>
              Last name:{' '}
              <input type="text" name="lastName" onChange={this.handleInputChange} />
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.handleClickUpdate}>
            Update
          </Button>
          <Button onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
