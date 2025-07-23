/**
 * Employee ID Generator using hash-based approach
 * Generates unique IDs in format: EMP followed by 5 digits (e.g., EMP12345)
 * 
 * This approach provides:
 * - O(1) ID generation time
 * - Extremely low collision probability
 * - Good distribution of IDs
 * - Automatic collision handling
 */

export class EmployeeIdGenerator {
  private counter = 0;
  private usedIds: Set<string> = new Set();

  constructor(existingIds: string[] = []) {
    this.usedIds = new Set(existingIds);
  }

  /**
   * Generates a unique employee ID
   * Time Complexity: O(1) average case
   * @returns Unique employee ID in format EMPxxxxx
   */
  generate(): string {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Combine multiple sources of entropy for better uniqueness
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const count = this.counter++;

      // Simple hash function with prime number multiplication
      const hash = ((timestamp * 31) + (random * 17) + (count * 13)) % 100000;
      const id = `EMP${String(Math.abs(hash)).padStart(5, "0")}`;

      if (!this.usedIds.has(id)) {
        this.usedIds.add(id);
        return id;
      }

      attempts++;
    }

    // Fallback to pure random if hash collisions occur
    return this.generateRandomUnique();
  }

  /**
   * Generates multiple unique employee IDs
   * @param count Number of IDs to generate
   * @returns Array of unique employee IDs
   */
  generateMultiple(count: number): string[] {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(this.generate());
    }
    return ids;
  }

  /**
   * Fallback method using pure random generation
   * Used when hash collisions occur
   */
  private generateRandomUnique(): string {
    let id: string;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      const num = Math.floor(Math.random() * 100000);
      id = `EMP${String(num).padStart(5, "0")}`;
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error("Unable to generate unique employee ID");
      }
    } while (this.usedIds.has(id));

    this.usedIds.add(id);
    return id;
  }

  /**
   * Checks if an ID already exists
   * Time Complexity: O(1)
   */
  exists(id: string): boolean {
    return this.usedIds.has(id);
  }

  /**
   * Gets the count of used IDs
   */
  get usedCount(): number {
    return this.usedIds.size;
  }
}

/**
 * Validates if a string follows the employee ID format
 * @param id String to validate
 * @returns true if valid employee ID format
 */
export function isValidEmployeeId(id: string): boolean {
  return /^EMP\d{5}$/.test(id);
}

/**
 * Extracts the numeric part from an employee ID
 * @param id Employee ID (e.g., "EMP12345")
 * @returns The numeric part as a number, or null if invalid
 */
export function extractIdNumber(id: string): number | null {
  const match = id.match(/^EMP(\d{5})$/);
  return match ? parseInt(match[1], 10) : null;
}

// For backwards compatibility and simple one-off generation
export function generateEmployeeId(existingIds: string[] = []): string {
  const generator = new EmployeeIdGenerator(existingIds);
  return generator.generate();
}