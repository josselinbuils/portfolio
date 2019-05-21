const { execSync } = require('child_process');

for (let i = 2; i < process.argv.length; i += 2) {
  const command = process.argv[i];
  const regex = process.argv[i + 1];
  const execCommand = `LIST=\`git diff-index --cached --name-only --diff-filter=d HEAD | grep -E "${regex}"\`; if [ "$LIST" ]; then echo ${command} $LIST; ${command} $LIST; fi`;

  try {
    execSync(execCommand, {
      cwd: process.cwd(),
      stdio: [process.stdin, process.stdout, process.stderr]
    });
  } catch (e) {
    process.exit(1);
  }
}
