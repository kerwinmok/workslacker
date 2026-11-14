# local zero-admin web server so i can run workslacker cleanly from my usb stick
$ErrorActionPreference = "Stop"

$usbRoot = $PSScriptRoot
# move working directory off the usb drive so windows can still eject cleanly later
Set-Location $env:TEMP

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Find-AppBrowser {
  $candidates = @(
    "msedge.exe",
    (Join-Path ${env:ProgramFiles(x86)} "Microsoft\Edge\Application\msedge.exe"),
    (Join-Path $env:ProgramFiles "Microsoft\Edge\Application\msedge.exe"),
    (Join-Path $env:LOCALAPPDATA "Microsoft\Edge\Application\msedge.exe"),
    "chrome.exe",
    (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
    (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
  )

  foreach ($item in $candidates) {
    if ([string]::IsNullOrWhiteSpace($item)) {
      continue
    }
    $cmd = Get-Command $item -ErrorAction SilentlyContinue
    if ($cmd) {
      return $cmd.Source
    }
    if (Test-Path -LiteralPath $item -PathType Leaf) {
      return $item
    }
  }
  return ""
}

function Start-AppWindow {
  param([string]$TargetUrl)

  $browserExe = Find-AppBrowser
  if ($browserExe -ne "") {
    Start-Process -FilePath $browserExe -ArgumentList "--app=$TargetUrl", "--window-size=1380,880"
  } else {
    Start-Process -FilePath $TargetUrl
  }
}

function Test-ExistingServer {
  param([int]$PortToCheck, [string]$ExpectedRoot)

  $probe = $null
  try {
    $probe = New-Object System.Net.Sockets.TcpClient
    $async = $probe.BeginConnect("127.0.0.1", $PortToCheck, $null, $null)
    if (-not $async.AsyncWaitHandle.WaitOne(200, $false)) {
      return $false
    }
    $probe.EndConnect($async)
    $stream = $probe.GetStream()
    $stream.ReadTimeout = 400
    $reqBytes = [System.Text.Encoding]::ASCII.GetBytes("GET /api/ping HTTP/1.1`r`nHost: 127.0.0.1`r`nConnection: close`r`n`r`n")
    $stream.Write($reqBytes, 0, $reqBytes.Length)
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    $resp = $reader.ReadToEnd()
    if ($resp -match [regex]::Escape("workslacker:" + $ExpectedRoot)) {
      return $true
    }
    return $false
  } catch {
    return $false
  } finally {
    if ($probe) {
      $probe.Close()
    }
  }
}

function Send-HttpResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$ContentType,
    [byte[]]$BodyBytes
  )

  $headerText = "HTTP/1.1 $StatusCode $StatusText`r`n" +
    "Content-Type: $ContentType`r`n" +
    "Content-Length: $($BodyBytes.Length)`r`n" +
    "Cache-Control: no-store`r`n" +
    "Access-Control-Allow-Origin: *`r`n" +
    "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n" +
    "Access-Control-Allow-Headers: Content-Type`r`n" +
    "Connection: close`r`n`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
  $Stream.Flush()
}

function Get-MimeType {
  param([string]$FilePath)

  $ext = [System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()
  if ($ext -eq ".html") { return "text/html; charset=utf-8" }
  if ($ext -eq ".css") { return "text/css; charset=utf-8" }
  if ($ext -eq ".js") { return "application/javascript; charset=utf-8" }
  if ($ext -eq ".json") { return "application/json; charset=utf-8" }
  if ($ext -eq ".png") { return "image/png" }
  if ($ext -eq ".jpg" -or $ext -eq ".jpeg") { return "image/jpeg" }
  if ($ext -eq ".svg") { return "image/svg+xml" }
  if ($ext -eq ".ico") { return "image/x-icon" }
  return "application/octet-stream"
}

function Save-PortableConfig {
  param([string]$JsonPayload)

  # parse and re-serialize so invalid json is rejected safely
  $parsed = $JsonPayload | ConvertFrom-Json
  $cleanJson = $parsed | ConvertTo-Json -Depth 10

  $jsonPath = Join-Path $usbRoot "advisors.json"
  $jsPath = Join-Path $usbRoot "advisors-config.js"

  [System.IO.File]::WriteAllText($jsonPath, $cleanJson + "`r`n", $utf8NoBom)

  $jsBody = "// portable config file so my advisors and cc presets load even over file://`r`n" +
    "window.USB_SAVED_CONFIG = " + $cleanJson + ";`r`n"
  [System.IO.File]::WriteAllText($jsPath, $jsBody, $utf8NoBom)
}

function Read-HttpRequest {
  param([System.Net.Sockets.NetworkStream]$Stream)

  $Stream.ReadTimeout = 5000
  $buffer = New-Object byte[] 4096
  $ms = New-Object System.IO.MemoryStream
  $headerEndIndex = -1

  while ($headerEndIndex -lt 0) {
    $readCount = $Stream.Read($buffer, 0, $buffer.Length)
    if ($readCount -le 0) {
      break
    }
    $ms.Write($buffer, 0, $readCount)
    $soFar = $ms.ToArray()
    for ($i = 0; $i -le ($soFar.Length - 4); $i++) {
      if ($soFar[$i] -eq 13 -and $soFar[$i + 1] -eq 10 -and $soFar[$i + 2] -eq 13 -and $soFar[$i + 3] -eq 10) {
        $headerEndIndex = $i
        break
      }
    }
    if ($ms.Length -gt 65536 -and $headerEndIndex -lt 0) {
      return $null
    }
  }

  if ($headerEndIndex -lt 0) {
    return $null
  }

  $allBytes = $ms.ToArray()
  $headerString = [System.Text.Encoding]::ASCII.GetString($allBytes, 0, $headerEndIndex)
  $lines = $headerString -split "`r`n"
  if ($lines.Length -eq 0) {
    return $null
  }

  $requestParts = $lines[0].Split(" ")
  if ($requestParts.Length -lt 2) {
    return $null
  }

  $contentLength = 0
  for ($i = 1; $i -lt $lines.Length; $i++) {
    $colonPos = $lines[$i].IndexOf(":")
    if ($colonPos -gt 0) {
      $hdrName = $lines[$i].Substring(0, $colonPos).Trim().ToLowerInvariant()
      if ($hdrName -eq "content-length") {
        $hdrVal = $lines[$i].Substring($colonPos + 1).Trim()
        [void][int]::TryParse($hdrVal, [ref]$contentLength)
      }
    }
  }

  $bodyStart = $headerEndIndex + 4
  $alreadyReadBody = $allBytes.Length - $bodyStart
  if ($alreadyReadBody -lt $contentLength) {
    $remaining = $contentLength - $alreadyReadBody
    while ($remaining -gt 0) {
      $toRead = [Math]::Min($buffer.Length, $remaining)
      $readCount = $Stream.Read($buffer, 0, $toRead)
      if ($readCount -le 0) {
        break
      }
      $ms.Write($buffer, 0, $readCount)
      $remaining = $remaining - $readCount
    }
  }

  $finalBytes = $ms.ToArray()
  $bodyText = ""
  if ($contentLength -gt 0 -and ($finalBytes.Length -ge ($bodyStart + $contentLength))) {
    $bodyText = [System.Text.Encoding]::UTF8.GetString($finalBytes, $bodyStart, $contentLength)
  }

  $rawTarget = $requestParts[1]
  $queryPos = $rawTarget.IndexOf("?")
  $cleanPath = $rawTarget
  if ($queryPos -ge 0) {
    $cleanPath = $rawTarget.Substring(0, $queryPos)
  }

  return @{
    Method = $requestParts[0].ToUpperInvariant()
    Path = $cleanPath
    Body = $bodyText
  }
}

# reuse existing local server for this usb folder if already running
for ($checkPort = 8765; $checkPort -le 8785; $checkPort++) {
  if (Test-ExistingServer -PortToCheck $checkPort -ExpectedRoot $usbRoot) {
    Start-AppWindow -TargetUrl "http://127.0.0.1:$checkPort/"
    exit 0
  }
}

$listener = $null
$activePort = 0
for ($tryPort = 8765; $tryPort -le 8785; $tryPort++) {
  try {
    $candidate = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $tryPort)
    $candidate.Start()
    $listener = $candidate
    $activePort = $tryPort
    break
  } catch {
    # try next port if busy
  }
}

if ($null -eq $listener) {
  Write-Error "could not bind a local port between 8765 and 8785."
  exit 1
}

$appUrl = "http://127.0.0.1:$activePort/"
Write-Host "workslacker running at $appUrl (usb folder: $usbRoot)"
Start-AppWindow -TargetUrl $appUrl

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $req = Read-HttpRequest -Stream $stream
      if ($null -eq $req) {
        continue
      }

      if ($req.Method -eq "OPTIONS") {
        Send-HttpResponse -Stream $stream -StatusCode 204 -StatusText "No Content" -ContentType "text/plain" -BodyBytes ([byte[]]@())
        continue
      }

      if ($req.Path -eq "/api/ping") {
        $pingBytes = $utf8NoBom.GetBytes("workslacker:" + $usbRoot)
        Send-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType "text/plain; charset=utf-8" -BodyBytes $pingBytes
        continue
      }

      if ($req.Path -eq "/api/config") {
        $configPath = Join-Path $usbRoot "advisors.json"
        if ($req.Method -eq "GET") {
          if (Test-Path -LiteralPath $configPath -PathType Leaf) {
            $jsonBytes = [System.IO.File]::ReadAllBytes($configPath)
            Send-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType "application/json; charset=utf-8" -BodyBytes $jsonBytes
          } else {
            $emptyBytes = $utf8NoBom.GetBytes("{}")
            Send-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType "application/json; charset=utf-8" -BodyBytes $emptyBytes
          }
          continue
        }

        if ($req.Method -eq "POST") {
          try {
            Save-PortableConfig -JsonPayload $req.Body
            $okBytes = $utf8NoBom.GetBytes('{"status":"saved"}')
            Send-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType "application/json; charset=utf-8" -BodyBytes $okBytes
          } catch {
            $errBytes = $utf8NoBom.GetBytes('{"error":"invalid json config"}')
            Send-HttpResponse -Stream $stream -StatusCode 400 -StatusText "Bad Request" -ContentType "application/json; charset=utf-8" -BodyBytes $errBytes
          }
          continue
        }
      }

      # static file serving from usb folder
      $relPath = $req.Path
      if ($relPath -eq "/") {
        $relPath = "/index.html"
      }
      $relPath = $relPath.TrimStart("/").Replace("/", "\")
      if ($relPath.Contains("..")) {
        $forbiddenBytes = $utf8NoBom.GetBytes("403 forbidden")
        Send-HttpResponse -Stream $stream -StatusCode 403 -StatusText "Forbidden" -ContentType "text/plain" -BodyBytes $forbiddenBytes
        continue
      }

      $fullFilePath = Join-Path $usbRoot $relPath
      if (Test-Path -LiteralPath $fullFilePath -PathType Leaf) {
        $fileBytes = [System.IO.File]::ReadAllBytes($fullFilePath)
        $mime = Get-MimeType -FilePath $fullFilePath
        Send-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType $mime -BodyBytes $fileBytes
      } else {
        $notFoundBytes = $utf8NoBom.GetBytes("404 not found")
        Send-HttpResponse -Stream $stream -StatusCode 404 -StatusText "Not Found" -ContentType "text/plain" -BodyBytes $notFoundBytes
      }
    } catch {
      # keep serving next request if client disconnects early
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
