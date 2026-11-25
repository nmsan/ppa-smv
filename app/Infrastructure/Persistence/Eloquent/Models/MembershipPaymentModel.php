<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Database row only. A ledger line: written once, never updated. */
class MembershipPaymentModel extends Model
{
    use HasUlids;

    protected $table = 'membership_payments';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['amount_cents' => 'integer', 'received_on' => 'immutable_date'];
    }

    /** @return BelongsTo<MemberModel, $this> */
    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }

    /** @return BelongsTo<User, $this> */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
