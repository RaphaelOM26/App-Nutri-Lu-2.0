# Redimensiona as fotos geradas. Usa System.Drawing do .NET porque esta máquina
# não tem ImageMagick nem ffmpeg (e não há Python).
#
#   powershell -File scripts/fotos/redimensionar.ps1 -Largura 420 -Qualidade 70 -Destino saida-thumbs
#
# Dois usos: miniaturas para a folha de contato (artefato tem limite de 16 MB)
# e a versão de ~800px que vai empacotada com o app.

param(
  [string]$Origem = "scripts/fotos/saida",
  [string]$Destino = "scripts/fotos/saida-thumbs",
  [int]$Largura = 420,
  [int]$Qualidade = 70,
  [string]$Filtro = "*-B-*.jpg"
)

Add-Type -AssemblyName System.Drawing

$origemAbs = (Resolve-Path $Origem).Path
if (-not (Test-Path $Destino)) { New-Item -ItemType Directory -Path $Destino -Force | Out-Null }
$destinoAbs = (Resolve-Path $Destino).Path

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [long]$Qualidade)

$arquivos = Get-ChildItem -Path $origemAbs -Filter $Filtro
$total = 0
$bytes = 0

foreach ($arq in $arquivos) {
  $img = [System.Drawing.Image]::FromFile($arq.FullName)
  try {
    $altura = [int][Math]::Round($img.Height * $Largura / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap($Largura, $altura)
    try {
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.DrawImage($img, 0, 0, $Largura, $altura)
      $g.Dispose()
      $saida = Join-Path $destinoAbs $arq.Name
      $bmp.Save($saida, $codec, $params)
      $bytes += (Get-Item $saida).Length
      $total++
    } finally { $bmp.Dispose() }
  } finally { $img.Dispose() }
}

$mb = [Math]::Round($bytes / 1MB, 1)
$kb = if ($total -gt 0) { [Math]::Round($bytes / $total / 1KB) } else { 0 }
Write-Output "$total imagens -> $Largura px, qualidade $Qualidade | total $mb MB | media $kb KB"
