import React from 'react';

import logo from '../logo.svg';

import './App.scss';
import {
  ContextMenuConsumer,
  ContextMenuProvider,
} from './platform/ContextMenuProvider';

const descriptor = {
  items: [{ onClick: () => console.log('Hello'), title: 'Hello' }],
};

export const App = () => (
  <ContextMenuProvider>
    <div className="App">
      <header className="App-header">
        <ContextMenuConsumer descriptor={descriptor}>
          <img src={logo} className="App-logo" alt="logo" />
        </ContextMenuConsumer>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  </ContextMenuProvider>
);
