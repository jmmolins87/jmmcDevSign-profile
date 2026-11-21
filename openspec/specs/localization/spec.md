# localization Specification

## Purpose

Esta capability proporciona una experiencia pública bilingüe y consistente, permitiendo navegar directamente en español o inglés y conservar la superficie equivalente al cambiar de idioma.

## Requirements

### Requirement: English public routes
La aplicación SHALL ofrecer rutas `/en` equivalentes a la landing, las cinco demos y la autenticación que existen bajo `/es`.

#### Scenario: Open English landing
- **WHEN** el usuario visita `/en/`
- **THEN** se muestra la landing en inglés con navegación, controles y contenido traducidos

#### Scenario: Open English demo
- **WHEN** el usuario visita una ruta de demo bajo `/en/demos/...`
- **THEN** se muestra la misma demo funcional en inglés con los estados y acciones disponibles bajo `/es`

#### Scenario: Open English authentication
- **WHEN** el usuario visita `/en/login`
- **THEN** se muestra la modal de autenticación con etiquetas, errores y estados en inglés

### Requirement: Equivalent language switching
El selector de idioma SHALL conservar la superficie equivalente al cambiar entre español e inglés.

#### Scenario: Switch landing language
- **WHEN** el usuario cambia de `/es/` a inglés
- **THEN** navega a `/en/` sin perder la posición lógica de la landing

#### Scenario: Switch demo language
- **WHEN** el usuario cambia de idioma dentro de una demo
- **THEN** navega a la ruta equivalente del otro idioma sin producir una ruta inexistente

#### Scenario: Switch authentication language
- **WHEN** el usuario cambia de idioma dentro de la autenticación
- **THEN** permanece en la vista equivalente de autenticación y conserva el estado local seguro del formulario

### Requirement: Complete translated interface
Los textos visibles de navegación, acciones, estados, validación, feedback accesible y errores de las superficies incluidas SHALL estar disponibles en ambos idiomas.

#### Scenario: No untranslated interface copy
- **WHEN** se inspecciona una superficie incluida en `/en`
- **THEN** sus textos operativos no muestran etiquetas españolas sin traducir salvo identificadores técnicos, nombres de producto o valores de datos fixture

#### Scenario: Unknown locale
- **WHEN** el usuario visita una ruta con un locale no soportado
- **THEN** la aplicación aplica el comportamiento de fallback definido para la navegación pública sin mostrar una página parcialmente traducida
