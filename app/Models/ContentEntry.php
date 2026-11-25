<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/** One editable piece of website content. See App\Content\ContentTypes. */
class ContentEntry extends Model
{
    use HasUlids, LogsActivity;

    protected $fillable = ['type', 'data', 'position', 'updated_by'];

    protected function casts(): array
    {
        return ['data' => 'array'];
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('content')
            ->logOnly(['type', 'data', 'position'])
            ->logOnlyDirty();
    }
}
