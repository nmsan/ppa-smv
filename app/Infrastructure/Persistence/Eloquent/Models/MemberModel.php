<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/** Database row only. Business rules live in App\Domain\Membership\Member. */
class MemberModel extends Model
{
    use HasUlids;

    protected $table = 'members';

    protected $guarded = [];

    protected $hidden = ['nic', 'nic_hash'];

    protected function casts(): array
    {
        return [
            'nic' => 'encrypted',
            'applied_at' => 'immutable_datetime',
            'approved_at' => 'immutable_datetime',
        ];
    }
}
