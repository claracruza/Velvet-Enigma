// FHE Client for public decryption via Zama Relayer

const RELAYER_URL = "https://relayer.testnet.zama.org";

/**
 * Request public decryption of ciphertext handles
 * @param handles Array of bytes32 handles to decrypt
 * @returns Decrypted values mapped by handle
 */
export async function publicDecrypt(
  handles: string[]
): Promise<Record<string, boolean | bigint | string>> {
  try {
    console.log("Requesting public decryption for handles:", handles);
    
    const response = await fetch(`${RELAYER_URL}/v1/decrypt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        handles: handles,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Decryption request failed:", response.status, errorText);
      throw new Error(`Decryption failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Decryption result:", result);
    
    return result;
  } catch (error) {
    console.error("Public decrypt error:", error);
    throw error;
  }
}

/**
 * Poll for decryption result (handles may not be ready immediately)
 */
export async function pollDecryption(
  handles: string[],
  maxAttempts: number = 10,
  delayMs: number = 2000
): Promise<Record<string, boolean | bigint | string>> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await publicDecrypt(handles);
      
      // Check if we got valid results
      const hasResults = Object.keys(result).length > 0;
      if (hasResults) {
        return result;
      }
    } catch (error) {
      console.log(`Decryption attempt ${attempt + 1} failed, retrying...`);
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error("Decryption timed out");
}
