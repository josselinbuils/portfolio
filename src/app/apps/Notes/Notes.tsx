import React, { ChangeEvent, useState } from 'react';
import { Window } from '~/platform/components/Window';
import { WindowComponent } from '~/platform/providers/WindowProvider';
import styles from './Notes.module.scss';

const smileys: { [smiley: string]: string } = {
  ':D': '\uD83D\uDE00',
  ':)': '\uD83D\uDE03',
  ';)': '\uD83D\uDE09',
  ':(': '\uD83D\uDE12',
  ':p': '\uD83D\uDE1B',
  ';p': '\uD83D\uDE1C'
};

export const Notes: WindowComponent = (props: any) => {
  const [notes, setNotes] = useState(getDefaultNotes());

  const saveNotes = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = Object.keys(smileys).reduce((notes, smiley) => {
      const escapedSmiley = smiley.replace(/([()[{*+.$^\\|?])/g, '\\$1');
      return notes.replace(new RegExp(escapedSmiley, 'gim'), smileys[smiley]);
    }, event.target.value);

    setNotes(newNotes);
    localStorage.setItem('notes', newNotes);
  };

  return (
    <Window
      background="#fff59c"
      titleColor="black"
      minWidth={400}
      minHeight={350}
      title="Notes"
      {...props}
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
