import chalk from 'chalk';
import terminalLink from 'terminal-link';
import { Dependency } from '../types';

export default class Printer {
  private verbose: boolean;
  private logStack: { msg: string; date: Date }[] = [];
  private totalDependencies = 0;
  private dependencies: Dependency[] = [];
  private currentPullingDependency: string | null = null;

  constructor(dependencyCount: number, vebrose: boolean) {
    this.totalDependencies = dependencyCount;
    this.verbose = vebrose;
    this.render();
  }

  private clearScreen() {
    process.stdout.write('\x1Bc');
  }

  private printRemainingDependencies() {
    console.log('=========================================');
    console.log(chalk.red(`         PULLING DEPENDENCY INFO         `));
    console.log('=========================================');
    console.log(
      `Current Dependency:\t\t${
        this.currentPullingDependency ? chalk.cyan(`${this.currentPullingDependency}`) : chalk.red('none')
      }`
    );
    console.log(`Remaining Dependencies:\t\t${chalk.cyan(`${this.totalDependencies - this.dependencies.length}`)}`);
    console.log(
      `Progress:\t\t\t${chalk.cyan(
        `${Math.round((1 - (this.totalDependencies - this.dependencies.length) / this.totalDependencies) * 100)}%`
      )}`
    );
  }

  private printHeader() {
    // output header
    console.log(`
    .JJJJJ7
    JP7: ^@@@@@G
    ^JB#^:@@@@@P
       : ^@@@@@P  :~!7!~.
  .5B57. ^@@@@@P^G@@@@@@#?     docdep
   :~J5. ^@@@@@@@BYG@@@@@@:    document
     ~~. ^@@@@@@J  ?@@@@@G.    dependencies
    .&&: ^@@@@@B~?G@&5YY7.     ${terminalLink('<www.kuatsu.de>', 'https://www.kuatsu.de')}
    Y@?  ^@@@@@&@@@@@B?
   !@&.  ^@@@@@G^G@@@@@#!
   ^YJ   ^@@@@@G  J@@@@@@?
         .JJJJJ7   7JJJJJJ.

Press ${chalk.cyan('CTRL + C')} to exit\n`);

    if (this.dependencies.length < this.totalDependencies) {
      this.printRemainingDependencies();
    }
  }

  private render() {
    this.clearScreen();
    this.printHeader();
    for (const log of this.logStack) {
      console.log(`[${log.date.toLocaleTimeString()}] ${log.msg}`);
    }
  }

  public addDependency(dependency: Dependency) {
    this.dependencies.push(dependency);
    this.render();
  }

  public log(msg: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
    switch (level) {
      case 'debug':
        if (!this.verbose) {
          return;
        }
        this.logStack.push({ msg: chalk.gray(msg), date: new Date() });
        break;
      case 'info':
        this.logStack.push({ msg, date: new Date() });
        break;
      case 'warn':
        this.logStack.push({ msg: chalk.yellow(msg), date: new Date() });
        break;
      case 'error':
        this.logStack.push({ msg: chalk.red(msg), date: new Date() });
        break;
      default:
        break;
    }
    this.render();
  }
}
