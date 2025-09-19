<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_number',
        'order_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'table_number',
        'order_type',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'discount_amount',
        'service_charge',
        'total_amount',
        'payment_method',
        'payment_status',
        'paid_amount',
        'change_amount',
        'payment_date',
        'payment_reference',
        'notes',
        'waiter_name',
        'created_by',
        'is_printed',
        'printed_at',
        'status'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'service_charge' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'printed_at' => 'datetime',
        'is_printed' => 'boolean'
    ];

    protected $dates = [
        'payment_date',
        'printed_at',
        'created_at',
        'updated_at'
    ];

    // Automatically generate bill number when creating
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($bill) {
            if (empty($bill->bill_number)) {
                $bill->bill_number = self::generateBillNumber();
            }
        });
    }

    /**
     * Generate unique bill number
     */
    public static function generateBillNumber(): string
    {
        $date = now()->format('Y-m');
        $lastBill = self::where('bill_number', 'like', "BILL-{$date}-%")
                       ->orderBy('bill_number', 'desc')
                       ->first();

        if ($lastBill) {
            $lastNumber = (int) substr($lastBill->bill_number, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return "BILL-{$date}-" . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Get the order associated with this bill
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who created this bill
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Calculate total amount including all charges
     */
    public function calculateTotal(): float
    {
        $subtotal = (float) $this->subtotal;
        $taxAmount = (float) $this->tax_amount;
        $discountAmount = (float) $this->discount_amount;
        $serviceCharge = (float) $this->service_charge;

        return $subtotal + $taxAmount + $serviceCharge - $discountAmount;
    }

    /**
     * Calculate tax amount based on subtotal and tax rate
     */
    public function calculateTaxAmount(): float
    {
        return ((float) $this->subtotal * (float) $this->tax_rate) / 100;
    }

    /**
     * Check if bill is fully paid
     */
    public function isFullyPaid(): bool
    {
        return $this->payment_status === 'paid' &&
               (float) $this->paid_amount >= (float) $this->total_amount;
    }

    /**
     * Check if bill is partially paid
     */
    public function isPartiallyPaid(): bool
    {
        return $this->payment_status === 'partially_paid' &&
               (float) $this->paid_amount > 0 &&
               (float) $this->paid_amount < (float) $this->total_amount;
    }

    /**
     * Get remaining amount to be paid
     */
    public function getRemainingAmount(): float
    {
        return max(0, (float) $this->total_amount - (float) $this->paid_amount);
    }

    /**
     * Mark bill as paid
     */
    public function markAsPaid(float $paidAmount, string $paymentMethod, string $paymentReference = null): void
    {
        $this->update([
            'paid_amount' => $paidAmount,
            'payment_method' => $paymentMethod,
            'payment_status' => $paidAmount >= $this->total_amount ? 'paid' : 'partially_paid',
            'payment_date' => now(),
            'payment_reference' => $paymentReference,
            'change_amount' => max(0, $paidAmount - $this->total_amount),
            'status' => 'paid'
        ]);
    }

    /**
     * Mark bill as printed
     */
    public function markAsPrinted(): void
    {
        $this->update([
            'is_printed' => true,
            'printed_at' => now()
        ]);
    }

    /**
     * Scope for filtering by payment status
     */
    public function scopeByPaymentStatus($query, string $status)
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for today's bills
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope for bills within date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get formatted bill number for display
     */
    public function getFormattedBillNumberAttribute(): string
    {
        return $this->bill_number;
    }

    /**
     * Get formatted total amount
     */
    public function getFormattedTotalAttribute(): string
    {
        return '$' . number_format($this->total_amount, 2);
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'draft' => 'gray',
            'generated' => 'blue',
            'paid' => 'green',
            'cancelled' => 'red',
            'refunded' => 'yellow',
            default => 'gray'
        };
    }

    /**
     * Get payment status badge color
     */
    public function getPaymentStatusColorAttribute(): string
    {
        return match($this->payment_status) {
            'pending' => 'yellow',
            'paid' => 'green',
            'partially_paid' => 'blue',
            'refunded' => 'red',
            default => 'gray'
        };
    }
}
