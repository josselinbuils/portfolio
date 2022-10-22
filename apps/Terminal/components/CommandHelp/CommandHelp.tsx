import type { FC } from 'react';
import styles from './CommandHelp.module.scss';

export const CommandHelp: FC<Props> = ({
  command,
  description,
  parameters,
}) => (
  <div className={styles.help}>
    <p>
      Usage: {command}{' '}
      {parameters
        .map(({ name, optional = false }) =>
          optional ? `[${name}]` : `<${name}>`
        )
        .join(' ')}
    </p>
    {description && <p className={styles.description}>{description}</p>}
    {parameters
      .filter((parameter) => parameter.values)
      .map(({ name, values = [] }) => (
        <div key={name}>
          <p>
            {capitalize(name)}
            {name.slice(-1) !== 's' && 's'}:
          </p>
          <div className={styles.values}>
            {values.map(({ value }) => (
              <p className={styles.value} key={value}>
                {!value.startsWith('-') && '- '}
                {value}
              </p>
            ))}
          </div>
          <div className={styles.descriptions}>
            {values.map(({ description: valueDescription = '', value }) => (
              <p className={styles.description} key={value}>
                {valueDescription}
              </p>
            ))}
          </div>
        </div>
      ))}
  </div>
);

interface Props {
  command: string;
  description?: string;
  parameters: CommandParameter[];
}

export interface CommandParameter {
  name: string;
  optional?: boolean;
  values?: { description?: string; value: string }[];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
