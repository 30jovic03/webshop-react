import React from 'react';
import { Container, Card, Col, Row, Button, Form, Nav } from 'react-bootstrap';
import { faImages, faMinus, faPlus, faBackward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Redirect, Link } from 'react-router-dom';
import api, { ApiResponse, apiFile } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import PhotoType from '../../Types/PhotoType';
import { ApiConfig } from '../../config/api.config';

interface AdministratorDashboardPhotoProperties {
  match: {
    params: {
      aId: number;
    }
  }
}

interface AdministratorDashboardPhotoState {
  isAdministratorLoggedIn: boolean;
  photos: PhotoType[];
}

class AdministratorDashboardPhoto extends React.Component<AdministratorDashboardPhotoProperties> {
  state: AdministratorDashboardPhotoState;

  constructor(props: Readonly<AdministratorDashboardPhotoProperties>) {
    super(props);

    this.state = {
      isAdministratorLoggedIn: true,
      photos: [],
    };
  }

  componentDidMount() {
    this.getPhotos();
  }
  componentDidUpdate(oldProps: any) {
    if (this.props.match.params.aId === oldProps.match.params.cId) {
      return;
    }

    this.getPhotos();
  }

  private getPhotos() {
    api('/api/article/' + this.props.match.params.aId + '/?join=photos', 'get', {}, 'administrator')
    .then((res: ApiResponse) => {
      if (res.status === "error" || res.status === "login") {
        this.setLogginState(false);
        return;
      }

      this.setState(Object.assign(this.state, {
        photos: res.data.photos,
      }));
    });
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
              <FontAwesomeIcon icon={ faImages } /> Photos
            </Card.Title>

            <Nav className="mb-3">
              <Nav.Item>
                <Link to="/administrator/dashboard/article/" className="btn btn-sm btn-info">
                  <FontAwesomeIcon icon={ faBackward } /> Go back to articles
                </Link>
              </Nav.Item>
            </Nav>

            <Row>
              { this.state.photos.map(this.printSinglePhoto, this) }
            </Row>

            <Form className="mt-5">
              <p>
                <strong>Add a new photo to this article</strong>
              </p>
              <Form.Group>
                <Form.Label htmlFor="add-photo">New article photo</Form.Label>
                <Form.File id="add-photo" />
              </Form.Group>
              <Form.Group>
                <Button variant="primary"
                        onClick={ () => this.doUpload() } >
                  <FontAwesomeIcon icon={ faPlus } /> Upload photo
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  private printSinglePhoto(photo: PhotoType) {
    return (
      <Col xs="12" sm="6" md="4" lg="3">
        <Card>
          <Card.Body>
            <img alt={ "Photo " + photo.photoId }
                 src={ ApiConfig.PHOTO_PATH + 'small/' + photo.imagePath }
                 className="w-100" />
          </Card.Body>
          <Card.Footer>
            { this.state.photos.length > 1 ? (
              <Button variant="danger" block
                      onClick={ () => this.deletePhoto(photo.photoId) } >
                <FontAwesomeIcon icon={ faMinus } /> Delete photo
              </Button>
            ) : '' }
          </Card.Footer>
        </Card>
      </Col>
    );
  }

  private async doUpload() {
    const filePicker: any = document.getElementById('add-photo');

    if (filePicker?.files.length === 0) {
      return;
    }

    const file = filePicker.files[0];
    await this.uploadArticlePhoto(this.props.match.params.aId, file);
    filePicker.value = '';

    this.getPhotos();
  }

  private async uploadArticlePhoto(articleId: number, file: File) {
    return await apiFile('/api/article/' + articleId + '/uploadPhoto/', 'photo', file, 'administrator');
  }

  private deletePhoto(photoId: number) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    api('/api/article/' + this.props.match.params.aId + '/deletePhoto/' + photoId + '/', 'delete', {}, 'administrator')
    .then((res: ApiResponse) => {
      if (res.status === "error" || res.status === "login") {
        this.setLogginState(false);
        return;
      }

      this.getPhotos();
    });
  }
}

export default AdministratorDashboardPhoto;
