export type GameLanguage = 'en' | 'es';

export const FOREST_NAMES_ES = ['Sendero Real', 'Cruce de las Copas', 'Cueva del Oso', 'Fortaleza de Duff', 'Ruinas del Río', 'Jardines Colgantes', 'Paso Raíz de Luna', 'Bastión del Golem'];

// Same placement and order as the English letters: translations never spawn
// extra notes or repeat a tutorial in later levels.
export const FOREST_LETTERS_ES = [
    ['Querido Vinn: A/D para moverte, W para saltar y ESPACIO para usar la espada. Mantén C para agacharte y caminar bajo los obstáculos. Sigue las señales del sendero real.',
     'Algunos lobos se esconden en los arbustos, pero muchos están vacíos. Un par de ojos brillantes te avisa del peligro. Retrocede cuando el lobo prepare su ataque y golpea mientras descansa.',
     'Los cristales de pluma te dan un segundo salto durante sesenta segundos. Recoge otro para reiniciar el minuto. Vigila el contador. El camino inferior se puede recorrer sin esta magia.'],
    ['Las ramas sobre el sendero forman una segunda ruta. Salta desde las ramas bajas para explorar las copas. Siempre puedes regresar al camino inferior.'],
    ['Pulsa E ante la puerta de la cueva. El oso da zarpazos y a veces levanta las patas delanteras para golpear el suelo. Salta la onda y ataca mientras descansa. Véncelo para abrir la salida.'],
    ['Duff espera tras estos pasillos. Agáchate bajo la barra alta y salta la baja. Activa DERECHA y luego IZQUIERDA. Las barras serán escalones. Sube hasta Duff y golpéalo. Cuatro golpes destruirán su máquina.'],
    ['El río arrasó el viejo puente. Usa las islas que quedan y los arcos de piedra. El agua bajo los huecos señala dónde cayó el puente.'],
    [], [],
    ['Pulsa E ante la puerta de la fortaleza. Duff lanza espadas desde la galería mientras el Golem ataca. Cada aterrizaje crea dos ondas, una a cada lado. Sáltalas, esquiva las piedras y ataca al Golem cuando esté aturdido.']
];

export const DUFF_TEXT_ES: Record<string, string> = {
    ESCAPE_DIALOGUE: 'Necesito.. contarle.. al Golem.. sobre.. esto...',
    ESCAPING: '¡Duff escapa por la ventana!',
    INTRO: '¡El Golem me envió a aplastarte primero! ¡Prepárate!',
    MOUNT: 'Duff está subiendo a su máquina…',
    POLE_RUN: 'C: agacharse • W: saltar • E / ESPACIO: botón DERECHO →',
    RETURN_LEFT: '← Vuelve al botón IZQUIERDO • E / ESPACIO',
    STAIR_ASSAULT: '¡Sube por las barras detenidas y golpea a Duff!',
    THROW_BACK: '¡Duff te lanza atrás! ¡La próxima ronda será más rápida!',
    DEFEATED: '¡Máquina destruida! La salida está abierta →',
    POLES_STOPPED: 'La máquina se ha detenido…'
};
