/**
 * Payment Processing Module
 * Supports: GCash, Maya, Credit Card, Escrow
 */

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: 'gcash' | 'maya' | 'card' | 'bank';
  description: string;
  buyer_email: string;
  seller_email: string;
  trade_id?: number;
}

export interface EscrowTransaction {
  id: number;
  trade_id: number;
  buyer_id: number;
  seller_id: number;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  payment_method: string;
  funded_at?: string;
  released_at?: string;
  expires_at: string;
}

/**
 * Create Payment Intent (Xendit/EBANX integration)
 * In production, use actual API credentials
 */
export async function createPaymentIntent(request: PaymentRequest): Promise<any> {
  // Simulate payment gateway integration
  const paymentIntent = {
    id: `pi_${Date.now()}`,
    amount: request.amount,
    currency: request.currency,
    method: request.method,
    status: 'pending',
    checkout_url: generateCheckoutUrl(request),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  };

  return paymentIntent;
}

/**
 * Generate checkout URL based on payment method
 */
function generateCheckoutUrl(request: PaymentRequest): string {
  const baseUrl = 'https://checkout.tradebinder.com';
  
  switch (request.method) {
    case 'gcash':
      return `${baseUrl}/gcash?amount=${request.amount}&ref=${Date.now()}`;
    case 'maya':
      return `${baseUrl}/maya?amount=${request.amount}&ref=${Date.now()}`;
    case 'card':
      return `${baseUrl}/card?amount=${request.amount}&ref=${Date.now()}`;
    default:
      return `${baseUrl}/payment?amount=${request.amount}&ref=${Date.now()}`;
  }
}

/**
 * Create Escrow Transaction for Trade
 */
export async function createEscrow(db: D1Database, data: {
  trade_id: number;
  buyer_id: number;
  seller_id: number;
  amount: number;
  payment_method: string;
}): Promise<EscrowTransaction> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const result = await db.prepare(`
    INSERT INTO escrow_transactions (
      trade_id, buyer_id, seller_id, amount, payment_method, status, expires_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).bind(
    data.trade_id,
    data.buyer_id,
    data.seller_id,
    data.amount,
    data.payment_method,
    expiresAt.toISOString()
  ).run();

  return {
    id: result.meta.last_row_id as number,
    ...data,
    status: 'pending',
    expires_at: expiresAt.toISOString(),
  };
}

/**
 * Fund Escrow (Buyer pays)
 */
export async function fundEscrow(db: D1Database, escrowId: number): Promise<void> {
  await db.prepare(`
    UPDATE escrow_transactions 
    SET status = 'funded', funded_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'pending'
  `).bind(escrowId).run();
}

/**
 * Release Escrow (Both parties confirm)
 */
export async function releaseEscrow(db: D1Database, escrowId: number): Promise<void> {
  await db.prepare(`
    UPDATE escrow_transactions 
    SET status = 'released', released_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'funded'
  `).bind(escrowId).run();
}

/**
 * Refund Escrow (Cancel trade)
 */
export async function refundEscrow(db: D1Database, escrowId: number): Promise<void> {
  await db.prepare(`
    UPDATE escrow_transactions 
    SET status = 'refunded', released_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status IN ('pending', 'funded')
  `).bind(escrowId).run();
}

/**
 * Mark Escrow as Disputed
 */
export async function disputeEscrow(db: D1Database, escrowId: number, reason: string): Promise<void> {
  await db.prepare(`
    UPDATE escrow_transactions 
    SET status = 'disputed'
    WHERE id = ?
  `).bind(escrowId).run();

  // Log dispute reason
  await db.prepare(`
    INSERT INTO escrow_disputes (escrow_id, reason, created_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `).bind(escrowId, reason).run();
}

/**
 * Get Escrow Transaction
 */
export async function getEscrow(db: D1Database, escrowId: number): Promise<EscrowTransaction | null> {
  const result = await db.prepare(`
    SELECT * FROM escrow_transactions WHERE id = ?
  `).bind(escrowId).first();

  return result as EscrowTransaction | null;
}

/**
 * Calculate Platform Fee (2.5% + ₱15)
 */
export function calculateFee(amount: number): { fee: number; total: number } {
  const fee = Math.round(amount * 0.025 + 15);
  return { fee, total: amount + fee };
}

/**
 * Verify Payment Webhook (from Xendit/EBANX)
 */
export async function verifyPaymentWebhook(body: any, signature: string, secret: string): Promise<boolean> {
  // In production, verify webhook signature
  // Example: crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
  return true;
}
