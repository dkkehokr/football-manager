const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Human-readable local date/time for a save's createdAt/updatedAt epoch millis. */
export function formatTimestamp(epochMillis: number): string {
  return timestampFormatter.format(new Date(epochMillis))
}
