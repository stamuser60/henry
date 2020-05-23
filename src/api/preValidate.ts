import { alertType } from '../core/alert';

/**
 * Receives a value that is either single object or list of objects, returns list of objects.
 */
function toList(value: object | object[]): object[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Type of a function that is passed to perform pre-validation on any data that comes from kafka.
 */
export type PreValidateFunc = (value: object | object[]) => object[];

/**
 * Performs pre validation logic on all the data that comes from kafka
 */
function genericPreValidate(value: object | object[]): object[] {
  return toList(value);
}

/**
 * Performs pre validation logic on the alert data that came from kafka.
 */
export function preValidateAlert(value: object | object[]): object[] {
  const valueList = genericPreValidate(value);
  for (const value of valueList) {
    (value as any)['type'] = alertType;
  }
  return valueList;
}

/**
 * Performs pre validation logic on the info data that came from kafka.
 */
export function preValidateInfo(value: object | object[]): object[] {
  return genericPreValidate(value);
}
