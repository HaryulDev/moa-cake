# 휴대폰에서 바로 테스트하기
# PC와 휴대폰이 같은 네트워크(공유기/와이파이)에 있으면, 휴대폰으로 QR 코드를 찍어 게임을 열 수 있어요.
# index.html을 고쳐서 저장하면 휴대폰 화면도 자동으로 새로고침돼요.
# 끝낼 때는 이 창에서 Ctrl+C 를 누르세요.

$port = 5500
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

# 이 PC의 내부 주소 (127.x, 169.254.x 제외)
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
       Where-Object { $_.IPAddress -notmatch '^(127|169\.254)' -and $_.PrefixOrigin -ne 'WellKnown' } |
       Sort-Object -Property InterfaceMetric |
       Select-Object -First 1).IPAddress
if (-not $ip) { Write-Host '네트워크 주소를 찾지 못했어요. 인터넷 연결을 확인해 주세요.' -ForegroundColor Red; exit 1 }

$url = "http://${ip}:${port}/"
Write-Host ''
Write-Host '  모아의 케이크 만들기 · 휴대폰 테스트' -ForegroundColor Magenta
Write-Host "  휴대폰 브라우저 주소: $url" -ForegroundColor Cyan
Write-Host '  (휴대폰 카메라로 아래 QR 코드를 찍어도 돼요)'
Write-Host ''
npx -y qrcode-terminal@0.12.0 $url
Write-Host ''
Write-Host '  처음 실행하면 Windows 방화벽 창이 뜰 수 있어요. "개인 네트워크"에 체크하고 허용을 눌러 주세요.' -ForegroundColor Yellow
Write-Host '  끝내려면 Ctrl+C' -ForegroundColor DarkGray
Write-Host ''

# 0.0.0.0 으로 열어서 같은 네트워크의 휴대폰이 접속할 수 있게 해요. 파일이 바뀌면 자동 새로고침.
npx -y live-server@1.2.2 "$here" --host=0.0.0.0 --port=$port --no-browser --entry-file=index.html --ignore=sample,.claude
