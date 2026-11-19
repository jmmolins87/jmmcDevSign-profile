# Reproducción mock local

`demo-playback.ts` define `PlaybackStep`, `PlaybackState` y `DemoPlaybackController`.
`createDemoPlayback` recibe pasos con IDs únicos, duración positiva y callbacks de
dominio. No conoce fixtures, repositorios, snapshots ni datos de ninguna demo.
`useDemoPlayback` conecta el controlador con React y lo detiene al desmontar.
`DemoPlaybackControls` presenta acciones, progreso, paso actual y errores en ES/EN.

`start()` restaura fixtures mediante `onReset` y programa el primer paso.
`pause()` conserva el tiempo restante; `resume()` continúa sin repetir efectos.
`reset()` invalida los temporizadores, espera una mutación ya iniciada y después
restaura fixtures, por lo que esa mutación no puede sobrescribir el reinicio.
Una operación ya iniciada puede terminar durante la pausa; no comienza ninguna
otra. Si era la última, el estado final es `completed`. Un error deja el
controlador en `paused`, conserva su causa y exige reinicio antes de continuar.
Los cambios de idioma actualizan las etiquetas y callbacks sin recrear negocio.
Cambiar IDs del plan durante la ejecución exige reiniciar el recorrido.

El reloj es inyectable (`now`, `setTimeout`, `clearTimeout`) y el reloj por defecto
es controlable con fake timers. `tests/unit/demo-playback.test.ts` verifica
duraciones restantes, idempotencia, fin, error y las carreras start/reset/unmount.
Los callbacks usan exclusivamente las operaciones mock de cada dominio;
ninguno de estos contratos realiza HTTP, WebSocket, SSE ni llama a IA remota.
Los snapshots permanecen aislados y cada adaptador conserva su propia validación
y política de persistencia. No se comparten fixtures entre demos.
