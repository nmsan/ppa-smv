<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/** Database row only. Business rules live in App\Domain\Membership\MembershipPlan. */
class MembershipPlanModel extends Model
{
    use HasUlids;

    protected $table = 'membership_plans';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['fee_cents' => 'integer', 'active' => 'boolean', 'position' => 'integer'];
    }
}
