import React from 'react';
import { Executor } from './Executor';

export const UserQuery: Executor = ({ args }) => (
  <p>
    {args[0]} {args[1]}
  </p>
);
