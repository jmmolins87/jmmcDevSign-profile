# demo-automation Specification

## Purpose

Esta capability convierte las cinco demos en recorridos visuales reproducibles, con automatización local, estados observables, controles accesibles y feedback suficiente para demostrar cada flujo sin depender de servicios externos.

## Requirements

### Requirement: Deterministic demo playback
Las cinco demos SHALL ofrecer un modo de reproducción mock iniciado explícitamente, con progreso visible, pausa, reanudación, reinicio y finalización determinista.

#### Scenario: Start playback
- **WHEN** el usuario activa el control de reproducción de una demo
- **THEN** la demo ejecuta sus pasos en orden y muestra el paso activo y el progreso

#### Scenario: Pause and resume playback
- **WHEN** el usuario pausa y después reanuda la reproducción
- **THEN** el flujo conserva el paso actual y continúa sin duplicar pasos ni eventos

#### Scenario: Reset playback
- **WHEN** el usuario reinicia una reproducción en curso o completada
- **THEN** la demo vuelve a sus fixtures iniciales y permite reproducir el recorrido otra vez

#### Scenario: Reduced motion playback
- **WHEN** `prefers-reduced-motion: reduce` está activo
- **THEN** el flujo conserva sus cambios de estado y feedback sin depender de animaciones largas

### Requirement: Collision-free workflow canvas
Leads Workflow SHALL renderizar sus nodos dentro de un layout determinista que mantenga una separación visible entre nodos y no permita solapamientos al alinear, reiniciar o restaurar el workspace.

#### Scenario: Initial workflow layout
- **WHEN** se abre Leads Workflow con los fixtures iniciales
- **THEN** todos los nodos son visibles, distinguibles y no cubren el contenido de otro nodo

#### Scenario: Auto-align workflow
- **WHEN** el usuario activa `[ AUTO-ALIGN ]`
- **THEN** los nodos adoptan posiciones válidas, las aristas siguen conectando los nodos correctos y no se produce solapamiento

#### Scenario: Restore workflow snapshot
- **WHEN** se restaura un snapshot local válido del workflow
- **THEN** el layout se valida antes de renderizarse y se recuperan fixtures seguros si las posiciones no son válidas

### Requirement: Sequential workflow execution animation
Leads Workflow SHALL mostrar la ejecución del flujo como un recorrido secuencial por nodos y aristas conectados.

#### Scenario: Execute workflow path
- **WHEN** el usuario dispara una simulación o un test del workflow
- **THEN** cada nodo se marca activo en orden, la arista correspondiente muestra el avance y el evento se registra antes de continuar

#### Scenario: Workflow execution completion
- **WHEN** el recorrido alcanza el último nodo
- **THEN** el workflow muestra el estado final, conserva la traza completa y deja disponible el reinicio

#### Scenario: Workflow execution error
- **WHEN** un paso del recorrido no puede completarse
- **THEN** el nodo afectado muestra estado de error, la traza explica el fallo y la reproducción se detiene sin ocultarlo

### Requirement: Automated order progression
Orders Realtime SHALL simular entradas de pedidos y su progresión por las columnas operativas de cocina.

#### Scenario: Incoming order
- **WHEN** el usuario inicia el escenario de pedidos entrantes
- **THEN** aparece un pedido nuevo con evento visible y estado `NUEVO`

#### Scenario: Kitchen progression
- **WHEN** la reproducción avanza o el usuario usa el control manual
- **THEN** el pedido cambia de `NUEVO` a `EN PLANCHA`, después a `LISTO` y finalmente a entregado sin duplicarse

#### Scenario: Pause order simulation
- **WHEN** el usuario pausa el escenario
- **THEN** no se generan nuevas entradas ni transiciones automáticas hasta reanudarlo

### Requirement: Lead qualification skeleton lifecycle
Lead Qualification SHALL retirar sus skeletons cuando termina la carga o cambia el escenario activo.

#### Scenario: Qualification load completes
- **WHEN** la simulación de cualificación termina de cargar sus datos
- **THEN** los skeletons desaparecen y se muestran los leads, métricas y acciones disponibles

#### Scenario: Qualification scenario changes
- **WHEN** el usuario cambia de escenario o reinicia la demo
- **THEN** los skeletons solo aparecen durante el estado de carga controlado y desaparecen al finalizarlo

### Requirement: Business backoffice view action
Business Backoffice SHALL abrir el expediente correspondiente cuando el usuario activa `[ VER ]` en un pedido.

#### Scenario: Open order dossier
- **WHEN** el usuario activa `[ VER ]` en una fila de pedidos
- **THEN** se abre el drawer con el cliente y pedido seleccionados, su historial y las acciones permitidas

#### Scenario: Close order dossier
- **WHEN** el usuario pulsa `Escape` o el control de cierre del drawer
- **THEN** el drawer se cierra, se restaura el foco y no se pierde el filtro o página activos

### Requirement: Visual interaction feedback
Cada demo SHALL mostrar feedback visible y accesible para acciones, estados de carga, estados vacíos, errores, progreso y finalización.

#### Scenario: Successful demo action
- **WHEN** el usuario completa una acción válida
- **THEN** la interfaz actualiza el estado relacionado, muestra una confirmación no bloqueante y refleja el cambio en la visualización o traza

#### Scenario: Empty or error state
- **WHEN** una demo no tiene registros visibles o una operación mock falla
- **THEN** muestra un estado explicativo, una acción de recuperación cuando corresponda y una región viva accesible

### Requirement: Responsive and accessible demo behavior
Las demos SHALL conservar sus acciones principales, navegación por teclado, foco visible y ausencia de overflow horizontal en 375px y 1440px.

#### Scenario: Mobile demo interaction
- **WHEN** una demo se renderiza a 375px
- **THEN** sus controles y estados principales permanecen accesibles sin solapamientos ni scroll horizontal involuntario

#### Scenario: Keyboard demo interaction
- **WHEN** el usuario navega mediante teclado
- **THEN** puede iniciar, pausar, reiniciar, avanzar y cerrar superficies interactivas con foco visible
