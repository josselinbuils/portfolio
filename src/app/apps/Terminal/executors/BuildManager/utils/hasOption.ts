export function hasOption(args: string[], option: string): boolean {
  return args.slice(1).includes(`-${option}`);
}
