module.exports = [
  {
    commands: ['eslint'],
    regex: /\.(js|tsx?)$/,
  },
  {
    commands: ['csscomb -tv'],
    regex: /\.scss$/,
  },
  {
    commands: ['prettier --write', 'git add'],
    regex: /\.(js|json|md|tsx?|scss)$/,
  },
];
