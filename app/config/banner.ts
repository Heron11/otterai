/**
 * Beta Banner Configuration
 * 
 * 🚀 QUICK DISABLE: Set BETA_BANNER_ENABLED to false
 * 
 * To disable the beta banner:
 * 1. Set BETA_BANNER_ENABLED to false
 * 2. The CSS variable --beta-banner-height will automatically be set to 0px
 * 3. All positioning will automatically adjust (workbench, floating user, etc.)
 * 
 * To re-enable the beta banner:
 * 1. Set BETA_BANNER_ENABLED to true
 * 2. The banner will appear and positioning will automatically adjust
 * 
 * The system automatically:
 * - Measures the actual banner height dynamically
 * - Updates CSS variables in real-time
 * - Adjusts all fixed-positioned elements
 * - Handles window resize events
 */

export const BETA_BANNER_ENABLED = true;

/**
 * Beta banner height in pixels (approximate)
 * This is used as a fallback if dynamic measurement fails
 */
export const BETA_BANNER_HEIGHT = 36; // Approximate height in pixels (smaller, compact design)
