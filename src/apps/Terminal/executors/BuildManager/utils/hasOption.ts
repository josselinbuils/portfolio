export function hasOption(args: string[], option: string): boolean {
  const commandArgs = args.slice(1);

  return (
    commandArgs.includes(`--${option}`) ||
    commandArgs.includes(`-${option.slice(0, 1)}`)
  );
}
