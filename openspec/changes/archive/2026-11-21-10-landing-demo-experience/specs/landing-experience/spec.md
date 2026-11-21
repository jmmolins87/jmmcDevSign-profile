# Spec Delta

## Purpose

Esta capability define una landing coherente, accesible y navegable, con controles de tema completos, acceso funcional a membresía y una presentación estable de las demos durante el scroll.

## ADDED Requirements

### Requirement: Header aligned with the content container
La landing SHALL alinear el header con el mismo contenedor horizontal que utiliza el contenido principal en todos los viewports soportados.

#### Scenario: Header alignment on desktop
- **WHEN** se renderiza la landing a 1440px de ancho
- **THEN** los extremos visuales del header y del contenido principal comparten la misma alineación horizontal sin padding lateral adicional no justificado

#### Scenario: Header alignment on mobile
- **WHEN** se renderiza la landing a 375px de ancho
- **THEN** el header permanece dentro del viewport y conserva la alineación con el contenido sin overflow horizontal

### Requirement: Reactive theme selection
La landing SHALL ofrecer controles icónicos para tema oscuro, tema claro y tema del sistema, manteniendo una única selección activa y accesible.

#### Scenario: Select explicit theme
- **WHEN** el usuario selecciona el icono de tema claro u oscuro
- **THEN** la interfaz aplica ese tema, marca el control seleccionado y conserva la elección localmente

#### Scenario: Follow operating system theme
- **WHEN** el usuario selecciona el modo sistema y cambia `prefers-color-scheme`
- **THEN** la interfaz cambia al tema correspondiente sin que el usuario tenga que recargar la página

#### Scenario: Theme storage unavailable
- **WHEN** el almacenamiento local no está disponible
- **THEN** el tema seleccionado permanece activo durante la sesión y se muestra un estado no bloqueante si existe feedback de persistencia

### Requirement: Functional membership entry
El CTA `[ Acceder ]` SHALL abrir la modal de autenticación/membresía existente desde el header, el menú editorial y la composición móvil.

#### Scenario: Open membership modal from header
- **WHEN** el usuario activa `[ Acceder ]` en el header
- **THEN** se abre la modal de autenticación con foco gestionado y sin navegar a una superficie de login independiente

#### Scenario: Open membership modal from menu
- **WHEN** el usuario abre el menú editorial y activa `[ Acceder ]`
- **THEN** el menú se cierra y se presenta la misma modal de autenticación

#### Scenario: Close membership modal
- **WHEN** el usuario cierra la modal mediante su control de cierre o la navegación del navegador
- **THEN** vuelve a la superficie anterior sin perder el contexto de navegación

### Requirement: Stable sticky demo presentation
La sección de demos SHALL mantener cada demo fijada durante un tramo de scroll amplio y cambiar de panel solo al cruzar umbrales estables.

#### Scenario: Scroll through a demo segment
- **WHEN** el usuario desplaza la landing dentro del tramo asignado a una demo
- **THEN** la demo permanece visible y no cambia de panel por pequeños movimientos del scroll

#### Scenario: Advance to next demo
- **WHEN** el usuario cruza el umbral del siguiente tramo
- **THEN** la demo activa cambia una sola vez y el indicador de progreso se actualiza

#### Scenario: Reduced motion sticky behavior
- **WHEN** `prefers-reduced-motion: reduce` está activo
- **THEN** la permanencia y los umbrales siguen siendo utilizables sin transiciones animadas obligatorias
