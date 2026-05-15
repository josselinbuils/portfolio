import { type FunctionComponent } from 'preact';

import classes from './CommandHelp.module.css';

export type CommandHelpProps = {
  command: string;
  description?: string;
  parameters: CommandParameter[];
};

export type CommandParameter = {
  name: string;
  optional?: boolean;
  values?: { description?: string; value: string }[];
};

export const CommandHelp: FunctionComponent<CommandHelpProps> = ({
  command,
  description,
  parameters,
}) => (
  <div className={classes.help}>
    <p>
      Usage: {command}{' '}
      {parameters
        .map(({ name, optional = false }) =>
          optional ? `[${name}]` : `<${name}>`,
        )
        .join(' ')}
    </p>
    {description && <p className={classes.description}>{description}</p>}
    {parameters
      .filter((parameter) => parameter.values)
      .map(({ name, values = [] }) => (
        <div key={name}>
          <p>
            {capitalize(name)}
            {name.slice(-1) !== 's' && 's'}:
          </p>
          <div className={classes.values}>
            {values.map(({ value }) => (
              <p className={classes.value} key={value}>
                {!value.startsWith('-') && '- '}
                {value}
              </p>
            ))}
          </div>
          <div className={classes.descriptions}>
            {values.map(({ description: valueDescription = '', value }) => (
              <p className={classes.description} key={value}>
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
