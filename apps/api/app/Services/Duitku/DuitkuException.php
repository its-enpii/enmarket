<?php

namespace App\Services\Duitku;

use RuntimeException;

class DuitkuException extends RuntimeException
{
    public function __construct(string $message, public readonly int $httpStatus = 0)
    {
        parent::__construct($message, $httpStatus);
    }
}
