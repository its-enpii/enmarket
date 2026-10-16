<?php

namespace Tests\Unit;

use App\Support\FileUploadGuard;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\TestCase;

class FileUploadGuardTest extends TestCase
{
    public function test_rejects_non_uploaded_file(): void
    {
        $this->assertFalse(FileUploadGuard::isValid(null));
        $this->assertFalse(FileUploadGuard::isValid('string-path'));
        $this->assertFalse(FileUploadGuard::isValid(123));
        $this->assertFalse(FileUploadGuard::isValid([]));
    }

    public function test_rejects_zero_byte_file(): void
    {
        $file = UploadedFile::fake()->create('blob', 0);
        $this->assertFalse(FileUploadGuard::isValid($file));
    }

    public function test_rejects_empty_filename(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'test_guard');
        file_put_contents($tmp, 'content');
        $file = new UploadedFile($tmp, '', 'text/plain', null, true);

        $this->assertFalse(FileUploadGuard::isValid($file));

        $whitespaceFile = new UploadedFile($tmp, '   ', 'text/plain', null, true);
        $this->assertFalse(FileUploadGuard::isValid($whitespaceFile));

        @unlink($tmp);
    }

    public function test_accepts_valid_file_with_size_and_name(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 10);
        $this->assertTrue(FileUploadGuard::isValid($file));
    }

    public function test_has_valid_file_with_request(): void
    {
        $validFile = UploadedFile::fake()->create('test.bin', 5);
        $zeroFile = UploadedFile::fake()->create('blob', 0);

        $request = Request::create('/test', 'POST', [], [], [
            'valid' => $validFile,
            'zero' => $zeroFile,
            'multi_zero' => [$zeroFile],
            'multi_mixed' => [$zeroFile, $validFile],
        ]);

        $this->assertTrue(FileUploadGuard::hasValidFile($request, 'valid'));
        $this->assertFalse(FileUploadGuard::hasValidFile($request, 'zero'));
        $this->assertFalse(FileUploadGuard::hasValidFile($request, 'multi_zero'));
        $this->assertTrue(FileUploadGuard::hasValidFile($request, 'multi_mixed'));
        $this->assertFalse(FileUploadGuard::hasValidFile($request, 'non_existent'));
    }
}
