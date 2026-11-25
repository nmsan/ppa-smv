<?php

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class FundraisingEventModel extends Model
{
    use HasUlids, LogsActivity;

    protected $table = 'fundraising_events';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['held_on' => 'immutable_date'];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->useLogName('finance')->logAll()->logOnlyDirty();
    }
}
