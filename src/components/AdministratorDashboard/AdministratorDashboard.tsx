import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Redirect, Link } from 'react-router-dom';
import api, { ApiResponse, getIdentity } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface AdministratorDashboardState {
  isAdministratorLoggedIn: boolean;
}

class AdministratorDashboard extends React.Component {
  state: AdministratorDashboardState;

  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      isAdministratorLoggedIn: true,
    };
  }

  componentDidMount() {
    this.getMyData();
  }

  private getMyData() {
    const administratorId = getIdentity('administrator');

    api('/api/administrator/' + administratorId, 'get', {}, 'administrator')
    .then((res: ApiResponse) => {
      if (res.status === "error" || res.status === "login") {
        this.setLogginState(false);
        return;
      }
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
        <Redirect to="/administrator/login/" />
      );
    }

    return (
      <Container>
        <RoledMainMenu role='administrator' />

        <Card>
          <Card.Body>
            <Card.Title>
              <FontAwesomeIcon icon={ faHome } /> Administrator Dashboard
            </Card.Title>

            <ul>
              <li><Link to="/administrator/dashboard/category/">Categories</Link></li>
              <li><Link to="/administrator/dashboard/feature/">Features</Link></li>
              <li><Link to="/administrator/dashboard/article/">Articles</Link></li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default AdministratorDashboard;
