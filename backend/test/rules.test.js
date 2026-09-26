import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCondition,
  getVisibleFields,
  validateFormDefinition,
  validateSubmission,
} from '../../shared/rules.js';
import { autoClaim, healthIntake } from '../src/seed/forms.js';

const names = (fields) => fields.map((f) => f.name);

test('seed forms are structurally valid', () => {
  assert.deepEqual(validateFormDefinition(autoClaim), []);
  assert.deepEqual(validateFormDefinition(healthIntake), []);
});

test('evaluateCondition: leaf operators', () => {
  assert.equal(evaluateCondition({ field: 'a', equals: 'x' }, { a: 'x' }), true);
  assert.equal(evaluateCondition({ field: 'a', equals: 'x' }, { a: 'y' }), false);
  assert.equal(evaluateCondition({ field: 'a', notEquals: 'x' }, {}), true);
  assert.equal(evaluateCondition({ field: 'a', in: ['x', 'y'] }, { a: 'y' }), true);
  assert.equal(evaluateCondition({ field: 'a', notIn: ['x'] }, { a: 'x' }), false);
  assert.equal(evaluateCondition({ field: 'n', gt: 5 }, { n: '6' }), true);
  assert.equal(evaluateCondition({ field: 'n', lt: 5 }, { n: 6 }), false);
  assert.equal(evaluateCondition({ field: 'a', exists: true }, { a: '' }), false);
  assert.equal(evaluateCondition({ field: 'a', exists: false }, {}), true);
  assert.equal(evaluateCondition(null, {}), true);
});

test('evaluateCondition: all / any combinators', () => {
  const v = { a: 1, b: 2 };
  assert.equal(evaluateCondition({ all: [{ field: 'a', equals: 1 }, { field: 'b', equals: 2 }] }, v), true);
  assert.equal(evaluateCondition({ all: [{ field: 'a', equals: 1 }, { field: 'b', equals: 9 }] }, v), false);
  assert.equal(evaluateCondition({ any: [{ field: 'a', equals: 9 }, { field: 'b', equals: 2 }] }, v), true);
});

test('showIf reveals only relevant follow-up questions', () => {
  const base = names(getVisibleFields(autoClaim, {}));
  assert.ok(!base.includes('animalType'));
  assert.ok(!base.includes('damageType'));

  const deer = names(getVisibleFields(autoClaim, { incidentType: 'animal_collision', vehicleDamaged: 'yes' }));
  assert.ok(deer.includes('animalType'));
  assert.ok(deer.includes('damageType'));
  assert.ok(!deer.includes('policeReportFiled'));
});

test('hiding a parent cascades to its dependents', () => {
  // policeReportFiled is stale-true but incidentType no longer shows it.
  const visible = names(
    getVisibleFields(autoClaim, { incidentType: 'weather_damage', policeReportFiled: true })
  );
  assert.ok(!visible.includes('policeReportFiled'));
  assert.ok(!visible.includes('policeReportNumber'));
});

test('section-level showIf hides the whole section', () => {
  assert.ok(!names(getVisibleFields(healthIntake, { visitReason: 'checkup' })).includes('painLevel'));
  assert.ok(names(getVisibleFields(healthIntake, { visitReason: 'injury' })).includes('painLevel'));
});

test('validateSubmission: required + format + hidden values dropped', () => {
  const r = validateSubmission(autoClaim, {
    incidentType: 'animal_collision',
    incidentDate: '09/24/2026',
    location: 'I-95',
    animalType: 'deer',
    vehicleMake: 'Honda',
    vehicleDamaged: 'no',
    damageType: 'windshield', // hidden because vehicleDamaged = no
    declaration: true,
  });
  assert.equal(r.valid, false);
  assert.equal(r.errors.incidentDate, 'Use the format YYYY-MM-DD');
  assert.equal(r.errors.damageType, undefined);
  assert.equal('damageType' in r.values, false);
});

test('validateSubmission: a complete valid claim passes', () => {
  const r = validateSubmission(autoClaim, {
    incidentType: 'animal_collision',
    incidentDate: '2026-09-24',
    location: 'I-95 exit 12',
    animalType: 'deer',
    vehicleMake: 'Honda',
    vehicleDamaged: 'yes',
    damageType: 'windshield',
    drivable: true,
    declaration: true,
  });
  assert.deepEqual(r.errors, {});
  assert.equal(r.valid, true);
  assert.equal(r.values.damageType, 'windshield');
  assert.equal(r.values.towingNeeded, undefined);
});

test('validateSubmission: required checkbox and bad select value', () => {
  const r = validateSubmission(autoClaim, { incidentType: 'nonsense', declaration: false });
  assert.match(r.errors.incidentType, /must be one of/);
  assert.match(r.errors.declaration, /must be checked/);
});

test('validateFormDefinition rejects bad showIf references', () => {
  const bad = (fields) =>
    validateFormDefinition({ sections: [{ id: 's', title: 'S', fields }] });
  const f = (name, extra = {}) => ({ name, label: name, type: 'text', ...extra });

  assert.match(bad([f('a', { showIf: { field: 'b', equals: 1 } }), f('b')])[0], /must be declared before/);
  assert.match(bad([f('a', { showIf: { field: 'a', equals: 1 } })])[0], /cannot depend on itself/);
  assert.match(bad([f('a'), f('a')])[0], /duplicate field name/);
  assert.match(bad([{ name: 'x', label: 'x', type: 'select' }])[0], /options/);
  assert.match(bad([f('a', { validation: { pattern: '(' } })])[0], /not a valid regex/);
  assert.match(bad([{ name: '1bad', label: 'x', type: 'text' }])[0], /invalid name/);
});
