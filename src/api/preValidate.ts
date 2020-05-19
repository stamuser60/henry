import { alertType } from '../core/alert';

function toList(value: object | object[]): object[] {
  return Array.isArray(value) ? value : [value];
}

export type PreValidateFunc = (value: object | object[]) => object[];

function genericPreValidate(value: object | object[]): object[] {
  /**
   * Performs pre validation logic on all the data that comes from kafka
   */
  return toList(value);
}

export function preValidateAlert(value: object | object[]): object[] {
  /**
   * Performs pre validation logic on the alert data that came from kafka.
   */
  const valueList = genericPreValidate(value);
  for (const value of valueList) {
    (value as any)['type'] = alertType;
  }
  return valueList;
}

export function preValidateInfo(value: object | object[]): object[] {
  /**
   * Performs pre validation logic on the info data that came from kafka.
   */
  return genericPreValidate(value);
}
