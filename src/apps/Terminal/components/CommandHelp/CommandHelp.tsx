import { type FC } from 'preact/compat';
import styles from './CommandHelp.module.scss';

export interface CommandParameter {
  name: string;
  optional?: boolean;
  values?: { description?: string; value: string }[];
}

export interface CommandHelpProps {
  command: string;
  description?: string;
  parameters: CommandParameter[];
}

export const CommandHelp: FC<CommandHelpProps> = ({
  command,
  description,
  parameters,
}) => (
  <div className={styles.help}>
    <p>
      Usage: {command}{' '}
      {parameters
        .map(({ name, optional = false }) =>
          optional ? `[${name}]` : `<${name}>`,
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

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
