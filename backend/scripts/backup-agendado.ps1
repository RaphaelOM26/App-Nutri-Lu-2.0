# Executa o backup do banco e registra o resultado num log.
#
# É isto que o Agendador de Tarefas chama — não o backup.mjs direto. O
# intermediário existe por três motivos: garantir o diretório de trabalho (o
# --env-file é relativo), guardar a saída num log (tarefa agendada roda sem
# ninguém olhando, e falha silenciosa em backup é o pior tipo) e devolver um
# código de saída que o Agendador consegue mostrar como "última execução".
#
# Pra registrar a tarefa, rode uma vez: .\agendar-backup.ps1

param(
  # Pasta de destino. O padrão é o OneDrive PESSOAL — assim a cópia sai do
  # Railway e da máquina ao mesmo tempo.
  # ⚠️ NÃO use o OneDrive do trabalho (Secretaria Municipal): dado de cliente
  # não vai pra conta de terceiro.
  [string]$Destino = "$env:USERPROFILE\OneDrive\Backups\NutriLu",
  [int]$Manter = 14
)

$ErrorActionPreference = 'Stop'

# Sem isto o PowerShell le a saida do node na codepage do console e os acentos
# viram lixo no log — que e justamente o arquivo que alguem vai ler as pressas.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$backend = Split-Path -Parent $PSScriptRoot
$log = Join-Path $backend 'backup.log'

# Log não pode crescer pra sempre numa tarefa diária.
if ((Test-Path $log) -and ((Get-Item $log).Length -gt 1MB)) {
  Get-Content $log -Tail 200 | Set-Content $log -Encoding UTF8
}

function Escreve($texto) {
  $linha = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm'), $texto
  Add-Content -Path $log -Value $linha -Encoding UTF8
  Write-Output $linha
}

Push-Location $backend
try {
  if (-not (Test-Path '.env')) { throw "backend\.env não encontrado — sem DATABASE_URL não há backup" }

  # ErrorActionPreference volta a 'Continue' só aqui: com 'Stop', QUALQUER linha
  # que o node escreva em stderr vira exceção e cai no catch — e aí o log perde
  # o detalhe do erro, que é justamente o que uma tarefa agendada precisa contar.
  $anterior = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $saida = & node --env-file=.env scripts/backup.mjs --destino "$Destino" --manter $Manter 2>&1
  $codigo = $LASTEXITCODE
  $ErrorActionPreference = $anterior

  if ($codigo -eq 0) {
    # Sem casar com o travessão: a saída do node volta em outra codificação e
    # '—' não bate. Ancorar em 'ok' e 'tabelas' é o que sobrevive.
    $resumo = (($saida | Where-Object { $_ -match '^ok' -or $_ -match 'tabelas' }) -join ' ').Trim()
    if (-not $resumo) { $resumo = "concluido (sem resumo na saida)" }
    Escreve "OK  $resumo"
  } else {
    Escreve "FALHOU (codigo $codigo)"
    $saida | ForEach-Object { Escreve "     $_" }
  }
  exit $codigo
}
catch {
  Escreve "FALHOU  $($_.Exception.Message)"
  exit 1
}
finally {
  Pop-Location
}
