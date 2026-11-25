<?php

namespace App\Providers;

use App\Application\Ports\ActorResolver;
use App\Application\Ports\Clock;
use App\Application\Ports\DashboardQueries;
use App\Application\Ports\EventDispatcher;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\MembershipNumberGenerator;
use App\Application\Ports\Notifier;
use App\Application\Ports\SupporterReadModel;
use App\Application\Ports\SupporterRepository;
use App\Application\Ports\UnitOfWork;
use App\Infrastructure\Access\EloquentActorResolver;
use App\Infrastructure\Notifications\LogNotifier;
use App\Infrastructure\Persistence\EloquentMemberRepository;
use App\Infrastructure\Persistence\EloquentMembershipNumberGenerator;
use App\Infrastructure\Persistence\EloquentSupporterRepository;
use App\Infrastructure\Queries\EloquentDashboardQueries;
use App\Infrastructure\Queries\EloquentSupporterReadModel;
use App\Infrastructure\System\DatabaseUnitOfWork;
use App\Infrastructure\System\LaravelEventDispatcher;
use App\Infrastructure\System\SystemClock;
use Illuminate\Support\ServiceProvider;

/** The one place where ports (interfaces) are connected to adapters (implementations). */
class DomainServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    public array $bindings = [
        MemberRepository::class => EloquentMemberRepository::class,
        MembershipNumberGenerator::class => EloquentMembershipNumberGenerator::class,
        UnitOfWork::class => DatabaseUnitOfWork::class,
        Clock::class => SystemClock::class,
        EventDispatcher::class => LaravelEventDispatcher::class,
        Notifier::class => LogNotifier::class,
        ActorResolver::class => EloquentActorResolver::class,
        DashboardQueries::class => EloquentDashboardQueries::class,
        SupporterRepository::class => EloquentSupporterRepository::class,
        SupporterReadModel::class => EloquentSupporterReadModel::class,
    ];
}
