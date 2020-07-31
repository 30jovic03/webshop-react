import React from 'react';
import './App.css';
import { Container, Card } from 'react-bootstrap';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() {
  return (
    <Container>
      <FontAwesomeIcon icon={ faHome } /> Home
    </Container>
  );
}

export default App;
