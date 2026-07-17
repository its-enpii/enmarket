<?php

namespace App\Services\Tripay;

use RuntimeException;

class TripayException extends RuntimeException
{
    public function __construct(string $message, public readonly int $httpStatus = 0)
    {
        parent::__construct($message, $httpStatus);
    }
}
