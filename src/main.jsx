import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App.jsx';
import { Prefs } from './context/Prefs.jsx';
import { AuthProvider } from './context/Auth.jsx';
import { CartProvider } from './context/Cart.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Prefs><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></Prefs>
  </HashRouter>
);
