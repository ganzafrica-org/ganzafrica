/**
 * ID Generation utility
 * Provides consistent ID generation across the application
 */

// We use the Snowflake-inspired ID generation for distributed systems
// This gives us time-sortable, unique IDs that work well in distributed environments

// Constants for snowflake ID generation
const EPOCH = 1640995200000; // Custom epoch (Jan 1, 2022)
const NODE_ID_BITS = 10;
const SEQUENCE_BITS = 12;

// Node ID (0-1023) - would be configured differently in production for each instance
// In production, this would come from environment variables or service discovery
let nodeId = parseInt(process.env.NODE_ID || "1", 10) % 1024;

// Sequence number (0-4095) - for IDs generated in the same millisecond
let sequence = 0;

// Last timestamp we generated an ID for
let lastTimestamp = -1;

/**
 * Generate a unique ID
 * @returns A unique 64-bit ID as a number
 */
export function generateId(): bigint {
  let timestamp = Date.now() - EPOCH;

  // If this is the same millisecond as the last ID generation,
  // increment the sequence number
  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1) & 4095; // 2^12 - 1

    // If we've run out of sequences for this millisecond, wait for the next millisecond
    if (sequence === 0) {
      while (timestamp <= lastTimestamp) {
        timestamp = Date.now() - EPOCH;
      }
    }
  } else {
    // We're in a new millisecond, reset the sequence
    sequence = 0;
  }

  lastTimestamp = timestamp;

  // Combine timestamp, nodeId, and sequence into a 64-bit ID
  const id =
    (BigInt(timestamp) << BigInt(NODE_ID_BITS + SEQUENCE_BITS)) |
    (BigInt(nodeId) << BigInt(SEQUENCE_BITS)) |
    BigInt(sequence);

  return id;
}

/**
 * Extract timestamp from an ID
 * @param id The ID to extract the timestamp from
 * @returns The timestamp as a Date object
 */
export function getTimestampFromId(id: bigint): Date {
  const timestamp = Number(id >> BigInt(NODE_ID_BITS + SEQUENCE_BITS)) + EPOCH;
  return new Date(timestamp);
}

/**
 * Extract node ID from an ID
 * @param id The ID to extract the node ID from
 * @returns The node ID
 */
export function getNodeIdFromId(id: bigint): number {
  return Number(
    (id >> BigInt(SEQUENCE_BITS)) & BigInt((1 << NODE_ID_BITS) - 1),
  );
}

/**
 * Extract sequence from an ID
 * @param id The ID to extract the sequence from
 * @returns The sequence
 */
export function getSequenceFromId(id: bigint): number {
  return Number(id & BigInt((1 << SEQUENCE_BITS) - 1));
}
