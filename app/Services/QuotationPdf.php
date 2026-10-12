<?php

namespace App\Services;

use App\Models\QuotationRequest;
use Carbon\Carbon;

class QuotationPdf
{
    private array $commands = [];

    public function make(QuotationRequest $quotation): string
    {
        $this->commands = [];

        $this->text('Malamal.com.bd', 44, 794, 16, true);
        $this->text('01708 521991', 455, 802, 9);
        $this->text('www.malamal.com.bd', 425, 789, 9);
        $this->text('support@malamal.com.bd', 413, 776, 9);
        $this->line(42, 758, 553, 758, 1.4);

        $this->text('QUOTATION', 245, 735, 18, true);

        $date = $quotation->updated_at ? Carbon::parse($quotation->updated_at)->format('F d, Y') : now()->format('F d, Y');
        $this->text('CUSTOMER INFORMATION :', 42, 700, 10, true);
        $this->text($quotation->name ?: '-', 42, 686, 9, true);
        $this->text($quotation->email ?: '-', 42, 674, 9);
        $this->text($quotation->phone ?: '-', 42, 662, 9);
        $this->text('Address: ' . ($quotation->address ?: '-'), 42, 650, 9);
        if ($quotation->company) {
            $this->text('Company: ' . $quotation->company, 42, 638, 9);
        }

        $this->text('DATE', 500, 686, 10, true);
        $this->text($date, 462, 672, 9);

        $startY = 610;
        $rowHeight = 78;
        $this->rect(42, $startY - $rowHeight, 511, $rowHeight);
        foreach ([68, 194, 348, 400, 476] as $x) {
            $this->line($x, $startY, $x, $startY - $rowHeight);
        }
        $this->line(42, $startY - 24, 553, $startY - 24);
        $this->text('Sl', 52, $startY - 16, 9, true);
        $this->text('Description of Items', 86, $startY - 16, 9, true);
        $this->text('Details / Specifications', 224, $startY - 16, 9, true);
        $this->text('Qty', 365, $startY - 16, 9, true);
        $this->text('Unit Price', 418, $startY - 16, 9, true);
        $this->text('Total Price', 491, $startY - 16, 9, true);

        $productName = $quotation->product_name ?: $this->firstLine($quotation->products) ?: 'Requested products';
        $details = $quotation->product_description ?: $quotation->products ?: $quotation->message ?: '-';
        $quantity = max((int) ($quotation->quantity ?: 1), 1);
        $price = (float) ($quotation->price ?: 0);
        $total = $quantity * $price;

        $this->text('1', 54, $startY - 50, 9);
        $this->multiline($productName, 74, $startY - 36, 26, 9, 11);
        $this->multiline($details, 202, $startY - 36, 32, 9, 11);
        $this->text((string) $quantity, 370, $startY - 50, 9);
        $this->text($this->money($price), 421, $startY - 50, 9);
        $this->text($this->money($total), 494, $startY - 50, 9);

        $this->text('Total = ' . $this->money($total), 470, 505, 10, true);
        $this->text('In Words: ' . $this->amountInWords($total) . ' only (Exclusive of VAT and Taxes)', 42, 472, 9, true);

        $this->text('Delivery & Payment Terms:', 42, 430, 10, true);
        $this->text('Delivery: ' . ($quotation->delivery_time ?: 'Within working days after order confirmation.'), 42, 416, 9, true);
        $this->text('Payment Terms:', 42, 386, 10, true);
        $this->text('- ' . ($quotation->advance_payment ?: 'Advance payment after order confirmation.'), 60, 370, 9);
        $this->text('- ' . ($quotation->at_delivery_payment ?: 'Remaining payment at the time of delivery.'), 60, 356, 9);
        $this->text('Price: Excludes VAT and taxes', 42, 326, 9, true);

        if ($quotation->brand_preference) {
            $this->text('Preferred Brand: ' . $quotation->brand_preference, 42, 302, 9, true);
        }

        if ($quotation->admin_notes) {
            $this->text('Admin Notes:', 42, 278, 9, true);
            $this->multiline($quotation->admin_notes, 42, 264, 90, 9, 12);
        }

        $this->text('Thank you and best regards,', 42, 205, 9);
        $this->text('Malamal Sales Team', 42, 158, 9, true);
        $this->text('Email: support@malamal.com.bd', 42, 144, 9);
        $this->text('Phone: 01708 521991', 42, 132, 9);

        $this->line(42, 92, 553, 92, 1.2);
        $this->text('OFFICE: Level-6, B-63, Malibag, Dhaka-1217', 154, 70, 8);
        $this->text('STORE: First Floor, Dhaka-1321', 196, 56, 8);

        return $this->renderPdf();
    }

    private function text(string $text, float $x, float $y, int $size = 10, bool $bold = false): void
    {
        $font = $bold ? 'F2' : 'F1';
        $this->commands[] = sprintf('BT /%s %d Tf %.2F %.2F Td (%s) Tj ET', $font, $size, $x, $y, $this->escape($text));
    }

    private function multiline(string $text, float $x, float $y, int $chars, int $size = 9, int $lineHeight = 11): void
    {
        $lines = array_slice($this->wrap($text, $chars), 0, 5);
        foreach ($lines as $index => $line) {
            $this->text($line, $x, $y - ($index * $lineHeight), $size);
        }
    }

    private function line(float $x1, float $y1, float $x2, float $y2, float $width = 0.7): void
    {
        $this->commands[] = sprintf('%.2F w %.2F %.2F m %.2F %.2F l S', $width, $x1, $y1, $x2, $y2);
    }

    private function rect(float $x, float $y, float $w, float $h): void
    {
        $this->commands[] = sprintf('%.2F %.2F %.2F %.2F re S', $x, $y, $w, $h);
    }

    private function wrap(string $text, int $chars): array
    {
        $text = preg_replace('/\s+/', ' ', trim($this->clean($text)));
        return $text === '' ? ['-'] : explode("\n", wordwrap($text, $chars, "\n", true));
    }

    private function firstLine(?string $text): ?string
    {
        if (!$text) {
            return null;
        }
        $line = trim(strtok($text, "\r\n"));
        return $line ?: null;
    }

    private function money(float $amount): string
    {
        return 'BDT ' . number_format($amount, 2);
    }

    private function amountInWords(float $amount): string
    {
        if ($amount <= 0) {
            return 'Zero Taka';
        }
        return number_format($amount, 2) . ' Taka';
    }

    private function clean(string $text): string
    {
        $text = str_replace(['৳', '–', '—'], ['BDT', '-', '-'], $text);
        $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $text);
        return $converted === false ? $text : $converted;
    }

    private function escape(string $text): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $this->clean($text));
    }

    private function renderPdf(): string
    {
        $content = implode("\n", $this->commands);
        $objects = [];
        $objects[] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objects[] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
        $objects[] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>';
        $objects[] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
        $objects[] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
        $objects[] = '<< /Length ' . strlen($content) . " >>\nstream\n" . $content . "\nendstream";

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1) . " 0 obj\n" . $object . "\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= str_pad((string) $offsets[$i], 10, '0', STR_PAD_LEFT) . " 00000 n \n";
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n" . $xref . "\n%%EOF";

        return $pdf;
    }
}