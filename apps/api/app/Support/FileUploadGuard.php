<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class FileUploadGuard
{
    public static function isValid(mixed $file): bool
    {
        if (! ($file instanceof UploadedFile)) {
            return false;
        }

        if (! $file->isValid()) {
            return false;
        }

        $fileSize = $file->getSize();
        if ($fileSize === false || $fileSize <= 0) {
            return false;
        }

        if (trim((string) $file->getClientOriginalName()) === '') {
            return false;
        }

        return true;
    }

    public static function hasValidFile(Request $request, string $key): bool
    {
        if (! $request->hasFile($key)) {
            return false;
        }

        $uploaded = $request->file($key);

        if (is_array($uploaded)) {
            foreach ($uploaded as $item) {
                if (self::isValid($item)) {
                    return true;
                }
            }

            return false;
        }

        return self::isValid($uploaded);
    }
}
