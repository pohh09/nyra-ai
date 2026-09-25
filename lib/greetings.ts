/**
 * Dynamic Time-Based Greeting System for Nyra AI
 * Selects a natural, context-aware greeting based on the user's local hour.
 */

export interface GreetingData {
  greeting: string;
  subtitle?: string;
}

const GREETINGS_EARLY_MORNING = [
  'A lovely morning to you.',
  'Wishing you a good start to the day.',
  'Here’s to a good day ahead.',
  'A fresh day, a fresh start.',
  'Hope today’s being kind to you.',
  'Sending a little good energy your way.',
];

const GREETINGS_MORNING = [
  'Morning! How’s it going?',
  'A lovely morning to you.',
  'Wishing you a good start to the day.',
  'Hope your day’s treating you well.',
  'A fresh day, a fresh start.',
  'What are we getting into today?',
  'Alright, what are we solving today?',
  'New day, new problem to solve.',
  'What’s on the agenda?',
];

const GREETINGS_AFTERNOON = [
  'Hey, good to see you!',
  'Hey there 👋',
  'Hope your day’s treating you well.',
  'Hey! What are we getting into today?',
  'Well, hello there.',
  'Ready when you are.',
  'What’s on the agenda?',
  'Let’s get into it.',
  'Brain online. What’s the plan?',
  'I’m here. Hit me.',
];

const GREETINGS_EVENING = [
  'Hey there 👋',
  'Well, look who’s here.',
  'Oh hey, you’re back!',
  'And we’re back at it 😌',
  'What’s cooking today?',
  'Okayyy, what’s the mission?',
  'Welcome back. What are we building today?',
  'Alright, let’s make something happen.',
  'Good to have you here.',
  'What are we working on today?',
  'Alright, tell me everything.',
  'Okay, I’m listening 👀',
];

const GREETINGS_NIGHT = [
  'Still up? 🌙',
  'A quiet night to you.',
  'Hope the night’s treating you gently.',
  'Late-night hello 🌙',
  'Good to see you at this hour.',
  'The night shift begins.',
  'Ah, a late-night visit.',
  'The night is young. What’s on your mind?',
  'Another quiet night, another conversation.',
  'Under the late-night sky, what are we thinking about?',
];

const GREETINGS_LATE_NIGHT = [
  'Still awake, huh? 👀',
  'Ah, you’re up late.',
  'Well well… look who’s still awake.',
  'Couldn’t sleep either? 😭',
  'The night owls have arrived.',
  'Okay, what’s keeping you up?',
  'Midnight thoughts again?',
  'Late-night brain online. What’s up?',
  'The world’s asleep. We’re still working.',
  'Quiet hours. What are we solving tonight?',
  'Night mode: activated. 🌙',
  'It’s late, but I’m here. What’s on your mind?',
  'Another late-night mission?',
  'Alright, night owl. What’s the plan?',
  'Some thoughts only show up after midnight.',
];

const GREETINGS_DEEP_NIGHT = [
  'Still awake? I’m here.',
  'Quiet hours, huh?',
  'Another late-night thought?',
  'The world’s quiet. What’s on your mind?',
  'Up early or just not asleep yet? 👀',
  'It’s definitely one of those hours.',
  'The night shift continues.',
  'Wherever the sleep went, I’m still here.',
  'A very late hello 🌙',
];

const SUBTITLES = [
  'What’s on your mind?',
  'Let’s make something.',
  'Got an idea?',
  'Give Nyra something interesting.',
  'Ready when you are.',
  'Let’s build.',
  'Turn thoughts into real progress.',
  'Ask anything or build a project.',
];

let lastGreeting = '';
let lastSubtitle = '';

export function getDynamicGreeting(): GreetingData {
  const now = new Date();
  const hour = now.getHours(); // 0 to 23

  let pool: string[];

  if (hour >= 5 && hour < 8) {
    // 5:00 AM to 7:59 AM
    pool = GREETINGS_EARLY_MORNING;
  } else if (hour >= 8 && hour < 12) {
    // 8:00 AM to 11:59 AM
    pool = GREETINGS_MORNING;
  } else if (hour >= 12 && hour < 17) {
    // 12:00 PM to 4:59 PM
    pool = GREETINGS_AFTERNOON;
  } else if (hour >= 17 && hour < 21) {
    // 5:00 PM to 8:59 PM
    pool = GREETINGS_EVENING;
  } else if (hour >= 21 && hour < 24) {
    // 9:00 PM to 11:59 PM
    pool = GREETINGS_NIGHT;
  } else if (hour >= 0 && hour < 3) {
    // 12:00 AM to 2:59 AM
    pool = GREETINGS_LATE_NIGHT;
  } else {
    // 3:00 AM to 4:59 AM
    pool = GREETINGS_DEEP_NIGHT;
  }

  // Filter out the last greeting if alternatives exist
  const availableGreetings =
    pool.length > 1 && lastGreeting
      ? pool.filter((g) => g !== lastGreeting)
      : pool;

  const chosenGreeting =
    availableGreetings[Math.floor(Math.random() * availableGreetings.length)] ||
    pool[0];

  lastGreeting = chosenGreeting;

  // Decide if we show a subtitle (keep it minimal and natural)
  // Check if greeting already ends with a question
  const greetingIsQuestion =
    chosenGreeting.endsWith('?') ||
    chosenGreeting.endsWith('👀') ||
    chosenGreeting.endsWith('hit me.');

  let chosenSubtitle: string | undefined = undefined;

  if (!greetingIsQuestion) {
    const availableSubtitles =
      SUBTITLES.length > 1 && lastSubtitle
        ? SUBTITLES.filter((s) => s !== lastSubtitle)
        : SUBTITLES;
    chosenSubtitle =
      availableSubtitles[Math.floor(Math.random() * availableSubtitles.length)];
    lastSubtitle = chosenSubtitle;
  }

  return {
    greeting: chosenGreeting,
    subtitle: chosenSubtitle,
  };
}
