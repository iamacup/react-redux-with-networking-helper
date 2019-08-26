
export function isDefined(value) {
  return !(typeof value === 'undefined' || value === null || (typeof value === 'string' && value.trim().length === 0));
}
