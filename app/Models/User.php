<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable(['name', 'email', 'avatar', 'phone', 'password', 'role', 'referral_code', 'wallet_balance'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            if (empty($user->referral_code)) {
                $user->referral_code = 'REF-'.strtoupper(Str::random(8));
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function loyaltyPoints(): HasMany
    {
        return $this->hasMany(LoyaltyPoint::class);
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function getWalletBalanceAttribute(): float
    {
        $deposits = $this->walletTransactions()->whereIn('type', ['deposit', 'refund'])->sum('amount');
        $withdrawals = $this->walletTransactions()->where('type', 'withdrawal')->sum('amount');

        return (float) ($deposits - $withdrawals);
    }

    public function getLoyaltyPointsBalanceAttribute(): int
    {
        $earned = $this->loyaltyPoints()->where('type', 'earn')->sum('points');
        $redeemed = $this->loyaltyPoints()->where('type', 'redeem')->sum('points');

        return (int) ($earned - $redeemed);
    }
}
