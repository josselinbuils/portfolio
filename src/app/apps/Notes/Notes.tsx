import React, { ChangeEvent, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import styles from './Notes.module.scss';

const smileys: { [smiley: string]: string } = {
  ':D': '\uD83D\uDE00',
  ':)': '\uD83D\uDE03',
  ';)': '\uD83D\uDE09',
  ':(': '\uD83D\uDE12',
  ':p': '\uD83D\uDE1B',
  ';p': '\uD83D\uDE1C'
};

export const Notes: WindowComponent = props => {
  const [notes, setNotes] = useState(getDefaultNotes);

  function saveNotes(event: ChangeEvent<HTMLTextAreaElement>): void {
    const newNotes = Object.keys(smileys).reduce((n, smiley) => {
      const escapedSmiley = smiley.replace(/([()[{*+.$^\\|?])/g, '\\$1');
      return n.replace(new RegExp(escapedSmiley, 'gim'), smileys[smiley]);
    }, event.target.value);

    setNotes(newNotes);
    localStorage.setItem('notes', newNotes);
  }

  return (
    <Window
      {...props}
      background="#fff59c"
      minHeight={350}
      minWidth={400}
      title={Notes.appName}
      titleColor="black"
    >
      <textarea
        className={styles.textarea}
        value={notes}
        onChange={saveNotes}
      />
    </Window>
  );
};

Notes.appName = 'Notes';
Notes.iconClass = 'fas fa-sticky-note';

function getDefaultNotes(): string {
  return localStorage.getItem('notes') !== null
    ? (localStorage.getItem('notes') as string)
    : 'Hello there 😃';
}
