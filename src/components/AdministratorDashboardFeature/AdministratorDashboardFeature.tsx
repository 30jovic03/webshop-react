import React from 'react';
import { Container, Card, Table, Button, Modal, ModalBody, Form, Alert } from 'react-bootstrap';
import { faPlus, faEdit, faListUl, faBackward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Redirect, Link } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import FeatureType from '../../Types/FeatureType';
import ApiFeatureDto from '../../dtos/ApiFeatureDto';

interface AdministratorDashboardFeatureProperties {
  match: {
    params: {
      cId: number;
    }
  }
}

interface AdministratorDashboardFeatureState {
  isAdministratorLoggedIn: boolean;
  features: FeatureType[];

  addModal: {
    visible: boolean;
    name: string;
    message: string;
  };

  editModal: {
    visible: boolean;
    featureId?: number;
    name: string;
    message: string;
  };
}

class AdministratorDashboardFeature extends React.Component<AdministratorDashboardFeatureProperties> {
  state: AdministratorDashboardFeatureState;

  constructor(props: Readonly<AdministratorDashboardFeatureProperties>) {
    super(props);

    this.state = {
      isAdministratorLoggedIn: true,
      features: [],

      addModal: {
        visible: false,
        name: '',
        message: '',
      },

      editModal: {
        visible: false,
        name: '',
        message: '',
      }
    };
  }

  private setAddModalVisibleState(newState: boolean) {
    this.setState(Object.assign(this.state, 
      Object.assign(this.state.addModal, {
        visible: newState,
      })
    ));
  }

  private setAddModalStringFieldState(fieldName: string, newValue: string) {
    this.setState(Object.assign(this.state, 
      Object.assign(this.state.addModal, {
        [ fieldName ]: newValue,
      })
    ));
  }

  private setEditModalVisibleState(newState: boolean) {
    this.setState(Object.assign(this.state, 
      Object.assign(this.state.editModal, {
        visible: newState,
      })
    ));
  }

  private setEditModalStringFieldState(fieldName: string, newValue: string) {
    this.setState(Object.assign(this.state, 
      Object.assign(this.state.editModal, {
        [ fieldName ]: newValue,
      })
    ));
  }

  private setEditModalNumberFieldState(fieldName: string, newValue: any) {
    this.setState(Object.assign(this.state, 
      Object.assign(this.state.editModal, {
        [ fieldName ]: (newValue === 'null') ? null : Number(newValue),
      })
    ));
  }

  componentDidMount() {
    this.getFeatures();
  }
  componentDidUpdate(oldProps: any) {
    if (this.props.match.params.cId === oldProps.match.params.cId) {
      return;
    }

    this.getFeatures();
  }

  private getFeatures() {
    api('/api/feature/?filter=categoryId||$eq||' + this.props.match.params.cId, 'get', {}, 'administrator')
    .then((res: ApiResponse) => {
      if (res.status === "error" || res.status === "login") {
        this.setLogginState(false);
        return;
      }

      this.putFeaturesInState(res.data);
    });
  }

  private putFeaturesInState(data: ApiFeatureDto[]) {
    // Moze i ovako samo u slucaju kada se poklapaju interfejsi ApiFeatureDto i FeatureType:
    // const features: FeatureType[] = data.map(feature => {feature});

    const features: FeatureType[] = data.map(feature => {
      return {
        featureId: feature.featureId,
        name: feature.name,
        categoryId: feature.categoryId,
      };
    });

    const newState = Object.assign(this.state, {
      features: features,
    });

    this.setState(newState);
  }

  private setLogginState(isLoggedIn: boolean) {
    this.setState(Object.assign(this.state, {
      isAdministratorLoggedIn: isLoggedIn,
    }));
  }

  render() {
    if (this.state.isAdministratorLoggedIn === false) {
      return (
        <Redirect to="/administrator/login" />
      );
    }

    return (
      <Container>
        <RoledMainMenu role='administrator' />

        <Card>
          <Card.Body>
            <Card.Title>
              <FontAwesomeIcon icon={ faListUl } /> Features
            </Card.Title>

            <Table hover size="sm" bordered>
              <thead>
                <tr>
                  <th colSpan={ 2 }>
                    <Link to="/administrator/dashboard/category/"
                          className="btn btn-sm btn-secondary">
                      <FontAwesomeIcon icon={ faBackward } /> Back to categories
                    </Link>
                  </th>
                  <th className="text-center">
                    <Button variant="primary" size="sm"
                            onClick={ () => this.showAddModal() }>
                      <FontAwesomeIcon icon={ faPlus } /> Add
                    </Button>
                  </th>
                </tr>
                <tr>
                  <th className="text-right">ID</th>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                { this.state.features.map(feature => (
                  <tr>
                    <td className="text-right">{ feature.featureId }</td>
                    <td>{ feature.name }</td>
                    <td className="text-center">
                      <Button variant="info" size="sm"
                              onClick={ () => this.showEditModal(feature) }>
                        <FontAwesomeIcon icon={ faEdit } /> Edit
                      </Button>
                    </td>
                  </tr>
                ), this) }
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Modal size="lg" centered show={ this.state.addModal.visible } onHide={ () => this.setAddModalVisibleState(false) }>
          <Modal.Header closeButton>
            <Modal.Title>Add new feature</Modal.Title>
          </Modal.Header>
          <ModalBody>
            <Form.Group>
              <Form.Label htmlFor="name">Name</Form.Label>
              <Form.Control id="name" type="text" value={ this.state.addModal.name }
                      onChange={ (e) => this.setAddModalStringFieldState('name', e.target.value) } />
            </Form.Group>
            { this.state.addModal.message ? (
              <Alert variant="danger" value={ this.state.addModal.message } />
            ) : '' }
            <Form.Group>
              <Button variant="primary" onClick={ () => this.doAddFeature() }>
                <FontAwesomeIcon icon={ faPlus } /> Add new feature
              </Button>
            </Form.Group>
          </ModalBody>
        </Modal>

        <Modal size="lg" centered show={ this.state.editModal.visible } onHide={ () => this.setEditModalVisibleState(false) }>
          <Modal.Header closeButton>
            <Modal.Title>Edit feature</Modal.Title>
          </Modal.Header>
          <ModalBody>
            <Form.Group>
              <Form.Label htmlFor="name">Name</Form.Label>
              <Form.Control id="name" type="text" value={ this.state.editModal.name }
                      onChange={ (e) => this.setEditModalStringFieldState('name', e.target.value) } />
            </Form.Group>
            { this.state.editModal.message ? (
              <Alert variant="danger" value={ this.state.editModal.message } />
            ) : '' }
            <Form.Group>
              <Button variant="primary" onClick={ () => this.doEditFeature() }>
                <FontAwesomeIcon icon={ faEdit } /> Edit feature
              </Button>
            </Form.Group>
          </ModalBody>
        </Modal>
      </Container>
    );
  }

  private showAddModal() {
    this.setAddModalStringFieldState('name', '');
    this.setAddModalStringFieldState('message', '');
    this.setAddModalVisibleState(true);
  }

  private doAddFeature() {
    api('/api/feature/', 'post', {
      name: this.state.addModal.name,
      categoryId: this.props.match.params.cId,
    }, 'administrator')
    .then((res: ApiResponse) => {
      if (res.status === "login") {
        this.setLogginState(false);
        return;
      }

      if (res.status === "error") {
        this.setAddModalStringFieldState('message', JSON.stringify(res.data));
        return;
      }

      this.setAddModalVisibleState(false);
      this.getFeatures();
    })
  }

  private showEditModal(feature: FeatureType) {
    this.setEditModalStringFieldState('name', String(feature.name));
    this.setEditModalNumberFieldState('featureId', feature.featureId.toString());
    this.setEditModalStringFieldState('message', '');
    this.setEditModalVisibleState(true);
  }

  private doEditFeature() {
    api('/api/feature/' + this.state.editModal.featureId, 'patch', {
      name: this.state.editModal.name,
    }, 'administrator')
    .then((res: ApiResponse) => {
      if (res.status === "login") {
        this.setLogginState(false);
        return;
      }

      if (res.status === "error") {
        this.setEditModalStringFieldState('message', JSON.stringify(res.data));
        return;
      }

      this.setEditModalVisibleState(false);
      this.getFeatures();
    })
  }
}

export default AdministratorDashboardFeature;
