import React from 'react';
import ReactDOM from 'react-dom';

import { App } from '~/App';
import { WindowProvider } from '~/platform/providers/WindowProvider';
import './index.scss';

ReactDOM.render(
  <WindowProvider>
    <App />
  </WindowProvider>,
  document.getElementById('root')
);
