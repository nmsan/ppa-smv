<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class SupporterModel extends Model
{
    use HasUlids, LogsActivity;

    protected $table = 'supporters';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['show_publicly' => 'boolean'];
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(ContributionModel::class, 'supporter_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(MemberModel::class, 'member_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('finance')->logAll()->logOnlyDirty();
    }
}
