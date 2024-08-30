import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import App from './App';
import './styles.css';

// Erstelle eine Wurzel
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render die App
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
