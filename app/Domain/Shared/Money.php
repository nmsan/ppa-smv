<?php

namespace App\Domain\Shared;

/**
 * An amount in Sri Lankan rupees, stored as whole cents to avoid rounding errors.
 * Rs. 1,000.00 is stored as 100000.
 */
final readonly class Money
{
    private function __construct(public int $cents) {}

    public static function fromCents(int $cents): self
    {
        return new self($cents);
    }

    public static function fromRupees(int $rupees): self
    {
        return new self($rupees * 100);
    }

    public static function zero(): self
    {
        return new self(0);
    }

    public function add(self $other): self
    {
        return new self($this->cents + $other->cents);
    }

    public function subtract(self $other): self
    {
        return new self($this->cents - $other->cents);
    }

    public function negate(): self
    {
        return new self(-$this->cents);
    }

    public function isPositive(): bool
    {
        return $this->cents > 0;
    }

    public function equals(self $other): bool
    {
        return $this->cents === $other->cents;
    }

    public function format(): string
    {
        $sign = $this->cents < 0 ? '-' : '';

        return $sign.'Rs. '.number_format(abs($this->cents) / 100, 2);
    }
}
