import { calculateMeetingCost } from './calculate-meeting-cost.js';

/** @type {string} */
const USAGE = 'Uso: npm start -- <participantes> <duracao-minutos> <custo-por-hora>';

/** @type {string[]} */
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error(USAGE);
  process.exit(1);
}

const participants = Number(args[0]);
const durationMinutes = Number(args[1]);
const costPerHour = Number(args[2]);

const result = calculateMeetingCost(participants, durationMinutes, costPerHour);

if (!result.ok) {
  console.error(`Erro: ${result.error}`);
  console.error(USAGE);
  process.exit(1);
}

console.log(
  `Custo total da reunião: ${result.totalCost.toFixed(2)} (${participants} participante(s), ${durationMinutes} min, ${costPerHour}/h)`,
);
