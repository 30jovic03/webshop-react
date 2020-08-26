import React from 'react';
import { Container, Card, Table, Button, Modal, ModalBody, Form, Alert } from 'react-bootstrap';
import { faListAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import CategoryType from '../../Types/CategoryType';
import ApiCategoryDto from '../../dtos/ApiCategoryDto';

interface AdministratorDashboardCategoryState {
  isAdministratorLoggedIn: boolean;
  categories: CategoryType[];

  addModal: {
    visible: boolean;
    name: string;
    imagePath: string;
    parentCategoryId: number | null;
    message: string;
  };

  editModal: {
    categoryId?: number;
    visible: boolean;
    name: string;
    imagePath: string;
    parentCategoryId: number | null;
    message: string;
  };
}

class AdministratorDashboardCategory extends React.Component {
  state: AdministratorDashboardCategoryState;

  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      isAdministratorLoggedIn: true,
      categories: [],

      addModal: {
        visible: false,
        name: '',
        imagePath: '',
        parentCategoryId: null,
        message: '',
      },

      editModal: {
        visible: false,
        name: '',
        imagePath: '',
        parentCategoryId: null,
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

  private setAddModalNumberFieldState(fieldName: string, newValue: any) {
    this.setState(Object.assign(this.state, 
      Object.assign(this.state.addModal, {
        [ fieldName ]: (newValue === 'null') ? null : Number(newValue),
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

  componentWillMount() {
    this.getCategories();
  }

  private getCategories() {
    api('/api/category/', 'get', {}, 'administrator')
    .then((res: ApiResponse) => {
      if (res.status === "error" || res.status === "login") {
        this.setLogginState(false);
        return;
      }

      this.putCategoriesInState(res.data);
    });
  }

  private putCategoriesInState(data: ApiCategoryDto[]) {
    const categories: CategoryType[] = data.map(category => {
      return {
        categoryId: category.categoryId,
        name: category.name,
        imagePath: category.imagePath,
        parentCategoryId: category.parentCategoryId,
      };
    });

    const newState = Object.assign(this.state, {
      categories: categories,
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
        <Redirect to="/administrator/login/" />
      );
    }

    return (
      <Container>
        <RoledMainMenu role='administrator' />

        <Card>
          <Card.Body>
            <Card.Title>
              <FontAwesomeIcon icon={ faListAlt } /> Categories
            </Card.Title>

            <Table hover size="sm" bordered>
              <thead>
                <tr>
                  <th colSpan={ 3 }></th>
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
                  <th className="text-right">Parent ID</th>
                </tr>
              </thead>
              <tbody>
                { this.state.categories.map(category => (
                  <tr>
                    <td className="text-right">{ category.categoryId }</td>
                    <td>{ category.name }</td>
                    <td className="text-right">{ category.parentCategoryId }</td>
                    <td className="text-center">
                      <Button variant="info" size="sm"
                              onClick={ () => this.showEditModal(category) }>
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
            <Modal.Title>Add new category</Modal.Title>
          </Modal.Header>
          <ModalBody>
            <Form.Group>
              <Form.Label htmlFor="name">Name</Form.Label>
              <Form.Control id="name" type="text" value={ this.state.addModal.name }
                      onChange={ (e) => this.setAddModalStringFieldState('name', e.target.value) } />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="imagePath">Image URL</Form.Label>
              <Form.Control id="imagePath" type="url" value={ this.state.addModal.imagePath }
                      onChange={ (e) => this.setAddModalStringFieldState('imagePath', e.target.value) } />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="parentCategoryId">Parent category</Form.Label>
              <Form.Control id="parentCategoryId" as="select" value={ this.state.addModal.parentCategoryId?.toString() }
                            onChange={ (e) => this.setAddModalNumberFieldState('parentCategoryId', e.target.value) }>
                <option value="null">No parent category</option>
                { this.state.categories.map(category => (
                  <option value={ category.categoryId?.toString() }>
                    { category.name }
                  </option>
                )) }
              </Form.Control>
            </Form.Group>
            { this.state.addModal.message ? (
              <Alert variant="danger" value={ this.state.addModal.message } />
            ) : '' }
            <Form.Group>
              <Button variant="primary" onClick={ () => this.doAddCategory() }>
                <FontAwesomeIcon icon={ faPlus } /> Add new category
              </Button>
            </Form.Group>
          </ModalBody>
        </Modal>

        <Modal size="lg" centered show={ this.state.editModal.visible } onHide={ () => this.setEditModalVisibleState(false) }>
          <Modal.Header closeButton>
            <Modal.Title>Edit category</Modal.Title>
          </Modal.Header>
          <ModalBody>
            <Form.Group>
              <Form.Label htmlFor="name">Name</Form.Label>
              <Form.Control id="name" type="text" value={ this.state.editModal.name }
                      onChange={ (e) => this.setEditModalStringFieldState('name', e.target.value) } />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="imagePath">Image URL</Form.Label>
              <Form.Control id="imagePath" type="url" value={ this.state.editModal.imagePath }
                      onChange={ (e) => this.setEditModalStringFieldState('imagePath', e.target.value) } />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="parentCategoryId">Parent category</Form.Label>
              <Form.Control id="parentCategoryId" as="select" value={ this.state.editModal.parentCategoryId?.toString() }
                            onChange={ (e) => this.setEditModalNumberFieldState('parentCategoryId', e.target.value) }>
                <option value="null">No parent category</option>
                { this.state.categories
                      .filter(category => category.categoryId !== this.state.editModal.categoryId)
                      .map(category => (
                  <option value={ category.categoryId?.toString() }>
                    { category.name }
                  </option>
                )) }
              </Form.Control>
            </Form.Group>
            { this.state.editModal.message ? (
              <Alert variant="danger" value={ this.state.editModal.message } />
            ) : '' }
            <Form.Group>
              <Button variant="primary" onClick={ () => this.doEditCategory() }>
                <FontAwesomeIcon icon={ faEdit } /> Edit category
              </Button>
            </Form.Group>
          </ModalBody>
        </Modal>
      </Container>
    );
  }

  private showAddModal() {
    this.setAddModalStringFieldState('name', '');
    this.setAddModalStringFieldState('imagePath', '');
    this.setAddModalNumberFieldState('parentCategoryId', 'null');
    this.setAddModalStringFieldState('message', '');
    this.setAddModalVisibleState(true);
  }

  private doAddCategory() {
    api('/api/category/', 'post', {
      name: this.state.addModal.name,
      imagePath: this.state.addModal.imagePath,
      parentCategoryId: this.state.addModal.parentCategoryId,
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
      this.getCategories();
    })
  }

  private showEditModal(category: CategoryType) {
    this.setEditModalStringFieldState('name', String(category.name));
    this.setEditModalStringFieldState('imagePath', String(category.imagePath));
    this.setEditModalNumberFieldState('parentCategoryId', category.parentCategoryId);
    this.setEditModalNumberFieldState('categoryId', category.categoryId);
    this.setEditModalStringFieldState('message', '');
    this.setEditModalVisibleState(true);
  }

  private doEditCategory() {
    api('/api/category/' + this.state.editModal.categoryId, 'patch', {
      name: this.state.editModal.name,
      imagePath: this.state.editModal.imagePath,
      parentCategoryId: this.state.editModal.parentCategoryId,
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
      this.getCategories();
    })
  }
}

export default AdministratorDashboardCategory;
