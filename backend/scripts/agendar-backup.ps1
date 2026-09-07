# Registra o backup diário no Agendador de Tarefas do Windows.
#
# Rode UMA VEZ, no PowerShell, a partir desta pasta:
#
#   .\agendar-backup.ps1
#   .\agendar-backup.ps1 -Hora "07:30"
#   .\agendar-backup.ps1 -Remover        # desfaz
#
# Não precisa de administrador: a tarefa é registrada no seu usuário e roda
# quando você está logado.
#
# ⚠️ Máquina desligada na hora marcada não perde o backup — a tarefa está com
# "iniciar assim que possível após uma execução perdida". Mas máquina desligada
# a semana inteira não faz backup nenhum. Se um dia isso virar problema, o
# mesmo backup.mjs roda num serviço agendado do Railway sem mudar uma linha.

param(
  [string]$Hora = "13:00",
  [string]$Destino = "$env:USERPROFILE\OneDrive\Backups\NutriLu",
  [int]$Manter = 14,
  [switch]$Remover
)

$ErrorActionPreference = 'Stop'
$nome = 'Nutri Lu - backup do banco'

if ($Remover) {
  Unregister-ScheduledTask -TaskName $nome -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host "Tarefa removida." -ForegroundColor Yellow
  return
}

$runner = Join-Path $PSScriptRoot 'backup-agendado.ps1'
if (-not (Test-Path $runner)) { throw "não achei backup-agendado.ps1 ao lado deste script" }

# Caminho absoluto do PowerShell e do script: a tarefa roda sem o PATH do seu
# shell, então nada aqui pode depender de "estar no PATH".
$acao = New-ScheduledTaskAction `
  -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runner`" -Destino `"$Destino`" -Manter $Manter" `
  -WorkingDirectory (Split-Path -Parent $PSScriptRoot)

$gatilho = New-ScheduledTaskTrigger -Daily -At $Hora

# StartWhenAvailable: recupera a execução perdida quando a máquina voltar.
# AllowStartIfOnBatteries + DontStop...: notebook no sofá também faz backup.
$config = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Register-ScheduledTask `
  -TaskName $nome `
  -Action $acao `
  -Trigger $gatilho `
  -Settings $config `
  -Description "Copia o banco de producao do Nutri Lu para $Destino. Ver backend/backup.log." `
  -Force | Out-Null

Write-Host "Agendado: todo dia as $Hora" -ForegroundColor Green
Write-Host "Destino:  $Destino"
Write-Host "Log:      $(Join-Path (Split-Path -Parent $PSScriptRoot) 'backup.log')"
Write-Host ""
Write-Host "Testar agora sem esperar o horario:" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName '$nome'"
Write-Host "Ver quando rodou e com que resultado:"
Write-Host "  Get-ScheduledTaskInfo -TaskName '$nome'"
