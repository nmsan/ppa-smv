<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ContributionModel extends Model
{
    use HasUlids, LogsActivity;

    protected $table = 'contributions';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['received_on' => 'immutable_date', 'voided_at' => 'immutable_datetime', 'amount_cents' => 'integer'];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(FundraisingEventModel::class, 'event_id');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function voider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('finance')->logAll()->logOnlyDirty();
    }
}
