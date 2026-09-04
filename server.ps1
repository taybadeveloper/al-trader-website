# Simple localhost static file server (no admin rights needed)
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Tayyaba Saleem\Desktop\Ai Trader'
$port = 8000

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Output "Server started: http://localhost:$port"

while ($true) {
    $stream = $null
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()

        # Skip request headers (read until blank line or EOF)
        while ($true) {
            $line = $reader.ReadLine()
            if ($null -eq $line -or $line -eq '') { break }
        }

        if ($requestLine) {
            $parts = $requestLine -split ' '
            $rawPath = $parts[1].Split('?')[0]
            if ($rawPath -eq '/') { $rawPath = '/index.html' }

            $rel = [System.Uri]::UnescapeDataString($rawPath.TrimStart('/')) -replace '/', '\'
            $file = Join-Path $root $rel

            if ($file.StartsWith($root) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
                $bytes = [System.IO.File]::ReadAllBytes($file)
                $ext = [System.IO.Path]::GetExtension($file).ToLower()
                $type = switch ($ext) {
                    '.html' { 'text/html; charset=utf-8' }
                    '.css'  { 'text/css; charset=utf-8' }
                    '.js'   { 'application/javascript; charset=utf-8' }
                    '.svg'  { 'image/svg+xml' }
                    '.png'  { 'image/png' }
                    '.jpg'  { 'image/jpeg' }
                    '.ico'  { 'image/x-icon' }
                    '.json' { 'application/json; charset=utf-8' }
                    default { 'application/octet-stream' }
                }
                $head = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
                $headBytes = [System.Text.Encoding]::ASCII.GetBytes($head)
                $stream.Write($headBytes, 0, $headBytes.Length)
                $stream.Write($bytes, 0, $bytes.Length)
            }
            else {
                $body = '<h1>404 Not Found</h1>'
                $b = [System.Text.Encoding]::UTF8.GetBytes($body)
                $head = "HTTP/1.1 404 Not Found`r`nContent-Type: text/html; charset=utf-8`r`nContent-Length: $($b.Length)`r`nConnection: close`r`n`r`n"
                $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
                $stream.Write($hb, 0, $hb.Length)
                $stream.Write($b, 0, $b.Length)
            }
        }

        $stream.Close()
        $client.Close()
    }
    catch {
        # Client aborted the connection (e.g., browser refresh/tab close) — ignore and keep serving
        if ($stream) { try { $stream.Close() } catch {} }
        if ($client) { try { $client.Close() } catch {} }
    }
}
