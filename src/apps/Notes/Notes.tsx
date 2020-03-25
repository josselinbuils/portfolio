import React, { ChangeEvent, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { NotesDescriptor } from './NotesDescriptor';

import styles from './Notes.module.scss';

const smileys: { [smiley: string]: string } = {
  ':D': '\uD83D\uDE00',
  ':)': '\uD83D\uDE03',
  ';)': '\uD83D\uDE09',
  ':(': '\uD83D\uDE12',
  ':p': '\uD83D\uDE1B',
  ';p': '\uD83D\uDE1C'
};

const Notes: WindowComponent = ({ windowRef, ...injectedWindowProps }) => {
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
      {...injectedWindowProps}
      background="#fff59c"
      minHeight={350}
      minWidth={400}
      ref={windowRef}
      title={NotesDescriptor.appName}
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

Notes.appDescriptor = NotesDescriptor;

export default Notes;

function getDefaultNotes(): string {
  return localStorage.getItem('notes') !== null
    ? (localStorage.getItem('notes') as string)
    : 'Hello there 😃';
}
