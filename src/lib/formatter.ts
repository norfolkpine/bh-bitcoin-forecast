
/**
 * Format a token value based on its decimals
 * @param value The raw token value as a string
 * @param decimals The number of decimals as a string
 * @returns Formatted token value
 */
export function formatTokenValue(value: string, decimals?: string): string {
  if (!value) return "0"

  // If no decimals provided, default to 18 for ETH-based tokens
  const decimalPlaces = decimals ? Number.parseInt(decimals) : 18

  // For tokens with 0 decimals, return the raw value
  if (decimalPlaces === 0) {
    return value
  }

  try {
    // For NFTs and tokens without proper decimals
    if (isNaN(decimalPlaces)) {
      return value
    }

    // Handle string values that might have commas or other formatting
    const cleanValue = value.toString().replace(/,/g, "")

    // For very large numbers, use a different approach
    if (cleanValue.length > 15) {
      // Try to use BigInt for precise calculation
      try {
        const valueBigInt = BigInt(cleanValue)
        const divisorBigInt = BigInt(10 ** decimalPlaces)

        // Get the whole number part
        const wholePart = valueBigInt / divisorBigInt

        // Get the fractional part (first few digits)
        const fractionalPart = valueBigInt % divisorBigInt
        let fractionalStr = fractionalPart.toString().padStart(decimalPlaces, "0")

        // Trim trailing zeros
        fractionalStr = fractionalStr.replace(/0+$/, "")

        if (fractionalStr.length > 4) {
          fractionalStr = fractionalStr.substring(0, 4)
        }

        // Format the result
        return fractionalStr.length > 0 ? `${wholePart.toString()}.${fractionalStr}` : wholePart.toString()
      } catch (e) {
        // Fallback to approximate formatting
        return abbreviateLargeNumber(cleanValue, decimalPlaces)
      }
    }

    // For smaller numbers, use standard JS number formatting
    const valueNum = Number(cleanValue) / Math.pow(10, decimalPlaces)

    // Format the number based on its size
    if (valueNum === 0) {
      return "0"
    } else if (valueNum < 0.000001) {
      return valueNum.toExponential(4)
    } else if (valueNum < 1) {
      return valueNum.toFixed(6)
    } else if (valueNum < 1000) {
      return valueNum.toFixed(4)
    } else {
      return valueNum.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
  } catch (error) {
    console.error("Error formatting token value:", error)
    return value
  }
}

/**
 * Abbreviate very large numbers that exceed JavaScript's Number precision
 * @param valueStr The raw value as a string
 * @param decimals The number of decimals
 * @returns Abbreviated value with suffix
 */
function abbreviateLargeNumber(valueStr: string, decimals: number): string {
  // Remove any commas or non-numeric characters except for digits
  const cleanValue = valueStr.replace(/[^\d]/g, "")

  // If the value is too short to need abbreviation, just format it normally
  if (cleanValue.length <= decimals) {
    return (Number.parseInt(cleanValue) / Math.pow(10, decimals)).toString()
  }

  // Calculate the integer part length
  const integerPartLength = cleanValue.length - decimals

  // Determine the suffix based on the integer part length
  let suffix = ""
  let divisor = 1

  if (integerPartLength > 12) {
    suffix = "T" // Trillion
    divisor = 1e12
  } else if (integerPartLength > 9) {
    suffix = "B" // Billion
    divisor = 1e9
  } else if (integerPartLength > 6) {
    suffix = "M" // Million
    divisor = 1e6
  } else if (integerPartLength > 3) {
    suffix = "K" // Thousand
    divisor = 1e3
  }

  // If we're not abbreviating, just return the formatted value
  if (divisor === 1) {
    // Format with the correct number of decimal places
    const formattedValue = (Number.parseInt(cleanValue) / Math.pow(10, decimals)).toFixed(2)
    return formattedValue
  }

  // Calculate the abbreviated value
  const integerPart = cleanValue.slice(0, integerPartLength)
  const decimalPart = cleanValue.slice(integerPartLength, integerPartLength + 2).padEnd(2, "0")

  // Format the abbreviated value
  const abbreviatedValue = `${integerPart.slice(0, -Math.log10(divisor))}.${decimalPart}`

  return `${Number.parseFloat(abbreviatedValue).toFixed(2)}${suffix}`
}

/**
 * Format an Ethereum value (ETH, transaction value, etc.)
 * @param value The raw value in wei
 * @returns Formatted value in ETH
 */
export function formatEthValue(value: string | number): string {
  if (!value) return "0"

  try {
    // Convert to string if it's a number
    const valueStr = typeof value === "number" ? value.toString() : value

    // Format with 18 decimals (wei to ETH)
    return formatTokenValue(valueStr, "18")
  } catch (error) {
    console.error("Error formatting ETH value:", error)
    return value.toString()
  }
}

