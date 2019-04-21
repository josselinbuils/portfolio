import React, { Component, ReactElement } from 'react';

import logo from '../logo.svg';

import './App.scss';
import {
  ContextMenuConsumer,
  ContextMenuProvider,
} from './platform/ContextMenu';

export class App extends Component {
  render(): ReactElement {
    return (
      <ContextMenuProvider>
        <div className="App">
          <header className="App-header">
            <ContextMenuConsumer>
              {showMenu => (
                <img
                  src={logo}
                  onClick={({ clientX: left, clientY: top }) => {
                    console.log('hello there');
                    showMenu({
                      items: [{ click: () => {}, title: 'hello' }],
                      position: { left, top },
                    });
                  }}
                  className="App-logo"
                  alt="logo"
                />
              )}
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
  }
}
