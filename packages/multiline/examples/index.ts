import { multiline } from '../src/index';
import { AbortError } from '../src/errors';

async function main() {
  try {
    const name = await multiline({
      prompt: 'What is your name?',
      placeholder: 'John Doe',
      required: true,
      spinner: true,
    });

    const description = await multiline({
      prompt: `Hi ${name}, please enter a project description.`,
      placeholder: 'My project is about...',
      maxLength: 100,
      validate: value => value.length > 10 || 'Description must be longer than 10 characters.',
    });

    console.log('\n--- Final Answer: ---');
    console.log(description);
    console.log('--------------------');
  } catch (error) {
    if (error instanceof AbortError) {
      console.log('Cancelled');
    } else {
      console.error('\nAn unexpected error occurred:');
      console.error(error);
    }
  }
}

main();
