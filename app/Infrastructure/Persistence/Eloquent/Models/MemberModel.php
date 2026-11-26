<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/** Database row only. Business rules live in App\Domain\Membership\Member. */
class MemberModel extends Model
{
    use HasUlids, LogsActivity;

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

    /** Every change to a member record is kept in the activity log, except the NIC itself. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('members')->logAll()->logExcept(['nic', 'nic_hash', 'updated_at'])->logOnlyDirty()->dontLogEmptyChanges();
    }
}
