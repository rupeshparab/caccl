const initPartialSimulation = require('caccl-canvas-partial-simulator');
const inquirer = require('inquirer');
const clear = require('clear');
const path = require('path');

/* eslint-disable no-console */

// Printing helpers
const W = process.stdout.columns;
// Calculates the number of spaces on the left of a centered line
const leftBuffer = (message) => {
  return (Math.floor(W / 2) - 1 - Math.ceil(message.length / 2));
};
// Calculates the number of spaces on the right of a centered line
const rightBuffer = (message) => {
  return (Math.ceil(W / 2) - 1 - Math.floor(message.length / 2));
};
// Centers and surrounds text with a border (on left and right)
const printMiddleLine = (str) => {
  console.log(
    '\u2551'
    + ' '.repeat(leftBuffer(str))
    + str
    + ' '.repeat(rightBuffer(str))
    + '\u2551'
  );
};

// Attempt to get the environment config
const launchDirectory = process.env.INIT_CWD;
const devEnvPath = path.join(launchDirectory, 'config/devEnvironment.js');
let devEnvironment;
try {
  devEnvironment = require(devEnvPath); // eslint-disable-line global-require, import/no-dynamic-require, max-len
} catch (err) {
  // Could not read the dev environment!
  devEnvironment = null;
}

// Verify the contents of the devEnvirnoment
if (
  !devEnvironment
  || !devEnvironment.courseId
  || !devEnvironment.canvasHost
  || (
    !devEnvironment.accessToken
    && !devEnvironment.accessTokens
  )
  || (
    devEnvironment.accessToken
    && devEnvironment.accessTokens
  )
) {
  // Invalid environment
  console.log('\nYour dev environment needs to be set up.');
  console.log('Set the contents of /config/devEnvironment.js to:');
  console.log('');
  console.log('module.exports = {');
  console.log('  courseId: 43819,                 // Sandbox course id');
  console.log('  canvasHost: \'canvas.school.edu\', // Canvas instance host');
  console.log('  accessToken: \'1949~fdjis...\',    // Canvas access token');
  console.log('  or (not both)');
  console.log('  accessTokens: { // Set of access tokens');
  console.log('    teacher: \'1949~fdjis...\',');
  console.log('    student: \'1949~58225...\',');
  console.log('    ^name     ^token');
  console.log('  },');
  console.log('};\n');
  process.exit(0);
}

// Extract the contents of the devEnvirnoment
const {
  courseId,
  canvasHost,
  accessToken,
  accessTokens,
  launchURL,
} = devEnvironment;

console.log('Starting a partially-simulated Canvas instance:');
console.log(`- Test course id: ${courseId}`);
console.log(`- Actual Canvas host: ${canvasHost} (api traffic forwarded here)`);
if (launchURL) {
  console.log(`- App launch URL: ${launchURL}`);
} else {
  console.log('- App launch URL: https://localhost/launch');
}

// Keep track of current chosen access token
let chosenTokenKey;
if (accessTokens) {
  chosenTokenKey = Object.keys(accessToken)[0];
}

// Create a simulated Canvas environment
const startSim = (currentAccessToken) => {
  const { server } = initPartialSimulation({
    courseId,
    canvasHost,
    accessToken,
    launchURL,
    onSuccess: async (port) => {
      // Simulation started
      console.log('\n\n');
      // Print top line
      console.log('\u2554' + '\u2550'.repeat(W - 2) + '\u2557');

      // Print middle lines
      printMiddleLine('Partially-simulated Canvas environment running!');
      printMiddleLine('To launch your app, visit:');
      printMiddleLine(`https://localhost:${port}/courses/${courseId}`);

      // Print bottom line
      console.log('\u255A' + '\u2550'.repeat(W - 2) + '\u255D');

      // Show a chooser if there are multiple token choices
      if (
        accessTokens
        && typeof accessTokens === 'object'
        && Object.keys(accessTokens).length > 0
      ) {
        // Print the current token
        console.log(`\nCurrently logged in as ${chosenTokenKey}'s`);
        const { tokenKey } = await inquirer.prompt([{
          type: 'list',
          name: 'tokenKey',
          message: 'Change who is logged in:',
          choices: Object.keys(accessTokens),
          default: chosenTokenKey,
        }]);

        // Restart the simulator
        clear();
        server.close();
        startSim(accessTokens[tokenKey]);
      }
    },
  });
};

// Start the initial simulation
if (accessToken) {
  startSim(accessToken);
} else {

}
