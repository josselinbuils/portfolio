import React from 'react';
import type { Executor } from './Executor';

export const UserQuery: Executor = ({ args }) => (
  <p>
    {args[0]} {args[1]}
  </p>
);
