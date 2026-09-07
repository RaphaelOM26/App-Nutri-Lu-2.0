# Confere se o backend/.env está com o que os scripts precisam.
#
#   .\conferir-env.ps1
#
# NÃO imprime nenhum valor — só diz se cada variável existe e se tem cara certa.
# A saída pode ser colada em qualquer lugar sem vazar senha nem chave.

$ErrorActionPreference = 'Stop'
$env_path = Join-Path (Split-Path -Parent $PSScriptRoot) '.env'

if (-not (Test-Path $env_path)) {
  Write-Host "NAO ENCONTREI o arquivo: $env_path" -ForegroundColor Red
  return
}

$linhas = Get-Content $env_path
Write-Host "arquivo: backend\.env  ($($linhas.Count) linhas)" -ForegroundColor Cyan
Write-Host ""

function Confere($nome, $bloco) {
  # @() força array: com UM resultado o Where-Object devolve string, e aí
  # $achou[0] pegaria o primeiro CARACTERE em vez da primeira linha.
  $achou = @($linhas | Where-Object { $_ -match "^\s*$nome\s*=" })
  if (-not $achou) {
    Write-Host "$nome : AUSENTE" -ForegroundColor Red
    return
  }
  $valor = [string](($achou[0] -split '=', 2)[1])
  if ($valor.Trim().Length -eq 0) {
    Write-Host "$nome : a linha EXISTE mas esta VAZIA" -ForegroundColor Red
    Write-Host "   falta colar o valor depois do sinal de igual" -ForegroundColor Red
    return
  }
  Write-Host "$nome : presente, $($valor.Length) caracteres" -ForegroundColor Green
  & $bloco $valor
}

Confere 'DATABASE_URL' {
  param($v)
  $ok = $v -like 'postgresql://*' -or $v -like 'postgres://*'
  Write-Host ("   comeca com postgresql:// ... " + $(if ($ok) { 'sim' } else { 'NAO — copiou errado?' })) -ForegroundColor $(if ($ok) { 'Gray' } else { 'Red' })

  $interna = $v -like '*railway.internal*'
  Write-Host ("   e a URL interna ......... " + $(if ($interna) { 'SIM — precisa ser a DATABASE_PUBLIC_URL' } else { 'nao, esta certa' })) -ForegroundColor $(if ($interna) { 'Red' } else { 'Gray' })

  $espaco = $v -match '\s'
  Write-Host ("   tem espaco no meio ...... " + $(if ($espaco) { 'SIM — apagar o espaco' } else { 'nao' })) -ForegroundColor $(if ($espaco) { 'Red' } else { 'Gray' })

  $aspas = $v.StartsWith('"') -or $v.StartsWith("'")
  Write-Host ("   comeca com aspas ........ " + $(if ($aspas) { 'SIM — tirar as aspas' } else { 'nao' })) -ForegroundColor $(if ($aspas) { 'Red' } else { 'Gray' })
}

Confere 'OPENAI_API_KEY' { param($v) }

Write-Host ""
Write-Host "Cole esta saida no chat — nao tem nenhum valor aqui, so verificacoes." -ForegroundColor Cyan
