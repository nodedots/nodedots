import { run } from "./run";
run(process.argv.slice(2), process.cwd(), text => process.stdout.write(text), text => process.stderr.write(text)).then(code => { process.exitCode = code; }).catch(() => { process.stderr.write("NodeDots: unexpected CLI error.\n"); process.exitCode = 2; });
