import cn from 'classnames';
import React, { FC, useRef } from 'react';
import { DICOMViewerDescriptor } from '~/apps/DICOMViewer/DICOMViewerDescriptor';
import { MP3PlayerDescriptor } from '~/apps/MP3Player/MP3PlayerDescriptor';
import { NotesDescriptor } from '~/apps/Notes/NotesDescriptor';
import { RedditDescriptor } from '~/apps/Reddit/RedditDescriptor';
import { TeraviaDescriptor } from '~/apps/Teravia/TeraviaDescriptor';
import { TerminalDescriptor } from '~/apps/Terminal/TerminalDescriptor';
import { useTaskDescriptors } from './hooks';
import { Task } from './Task';
import { getTaskKey } from './utils';

import styles from './TaskBar.module.scss';

// Has to be in a constant to avoid useless recurrent computations
const PINNED_APPS_DESCRIPTORS = [
  TerminalDescriptor,
  DICOMViewerDescriptor,
  MP3PlayerDescriptor,
  TeraviaDescriptor,
  RedditDescriptor,
  NotesDescriptor
];

export const TaskBar: FC<Props> = ({ className }) => {
  const taskBarRef = useRef(null);
  const taskDescriptors = useTaskDescriptors(PINNED_APPS_DESCRIPTORS);

  return (
    <div className={cn(styles.taskBar, className)} ref={taskBarRef}>
      {taskDescriptors.map(({ appDescriptor, windowInstance }, index) => (
        <Task
          appDescriptor={appDescriptor}
          taskBarRef={taskBarRef}
          key={getTaskKey(appDescriptor, windowInstance, index)}
          windowInstance={windowInstance}
        />
      ))}
    </div>
  );
};

interface Props {
  className?: string;
}
