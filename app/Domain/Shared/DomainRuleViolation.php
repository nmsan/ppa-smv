<?php

namespace App\Domain\Shared;

/** Thrown when a business rule in the domain would be broken. */
final class DomainRuleViolation extends \DomainException {}
