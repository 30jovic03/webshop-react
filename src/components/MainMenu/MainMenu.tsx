import React from 'react';
import { Nav, Container } from 'react-bootstrap';

export class MainMenu extends React.Component {
  render() {
    return (
      <Container>
        <Nav variant="tabs">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/contact">Contact</Nav.Link>
          <Nav.Link href="/login">Log in</Nav.Link>
        </Nav>
      </Container>
    )
  }
}