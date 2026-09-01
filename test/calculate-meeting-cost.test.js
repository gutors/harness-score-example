import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { calculateMeetingCost } from '../src/calculate-meeting-cost.js';

describe('calculateMeetingCost', () => {
  test('calcula custo válido', () => {
    const result = calculateMeetingCost(5, 60, 100);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.totalCost, 500);
    }
  });

  test('preserva valor fracionário para arredondamento na CLI', () => {
    const result = calculateMeetingCost(3, 10, 33.33);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.totalCost, 16.665);
    }
  });

  test('rejeita participantes abaixo de 1', () => {
    const result = calculateMeetingCost(0, 60, 100);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'O número de participantes deve ser pelo menos 1.');
    }
  });

  test('rejeita duração não positiva', () => {
    const zero = calculateMeetingCost(1, 0, 100);
    assert.equal(zero.ok, false);
    if (!zero.ok) {
      assert.equal(zero.error, 'A duração deve ser maior que zero minutos.');
    }

    const negative = calculateMeetingCost(1, -5, 100);
    assert.equal(negative.ok, false);
    if (!negative.ok) {
      assert.equal(negative.error, 'A duração deve ser maior que zero minutos.');
    }
  });

  test('rejeita custo por hora negativo', () => {
    const result = calculateMeetingCost(1, 60, -1);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'O custo por hora não pode ser negativo.');
    }
  });

  test('rejeita entradas não finitas', () => {
    const cases = [
      [Number.NaN, 60, 100],
      [5, Number.POSITIVE_INFINITY, 100],
      [5, 60, Number.NEGATIVE_INFINITY],
    ];

    for (const [participants, durationMinutes, costPerHour] of cases) {
      const result = calculateMeetingCost(participants, durationMinutes, costPerHour);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.equal(result.error, 'Todos os valores devem ser números finitos.');
      }
    }
  });
});
