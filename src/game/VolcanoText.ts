export const VOLCANO_GUIDES = {
    en: {
        LIVING_VOLCANO: [
            { title: 'The Living Volcano', text: 'The mountain is awake! Fireballs launch from its crater and fall onto the marked spots. Keep moving during the eruption.' },
            { title: 'Watch its mouth!', text: 'When the mouth glows, hold C to crouch beneath the beam. Player 2 holds the down arrow. You can move while crouching.' },
            { title: 'Strike the molten core!', text: 'After the beam, the volcano exposes a glowing core on the ground beneath its face for five seconds. Get close and strike it with your sword!' }
        ],
        BLAZE_KING: [
            { title: 'Rain of Fire', text: 'Blaze King rains fireballs, chases you through the air, then slams down. Dodge his landing and strike while he is dizzy.' },
            { title: 'The volcano awakens!', text: 'When weakened, Blaze King rises out of reach. The volcano behind him opens its eyes and charges a mouth beam. Hold C to crouch; Player 2 holds the down arrow.' },
            { title: 'Keep fighting!', text: 'Blaze King returns dizzy after the beam. Strike him! His normal attacks continue, and the volcano fires again if you have not defeated him.' }
        ]
    },
    es: {
        LIVING_VOLCANO: [
            { title: 'El Volcán Viviente', text: '¡La montaña despertó! Lanza bolas de fuego desde su cráter que caen sobre las marcas del suelo. Muévete durante la erupción.' },
            { title: '¡Mira su boca!', text: 'Cuando brille su boca, mantén C para agacharte bajo el rayo. El jugador 2 usa la flecha abajo. Puedes caminar agachado.' },
            { title: '¡Golpea el núcleo!', text: 'Después del rayo, el volcán expone un núcleo brillante en el suelo, debajo de su cara, durante cinco segundos. ¡Acércate y golpéalo con la espada!' }
        ],
        BLAZE_KING: [
            { title: 'Lluvia de fuego', text: 'El Rey de Fuego hace llover bolas de fuego, te persigue por el aire y cae con fuerza. Esquiva su caída y golpéalo cuando esté mareado.' },
            { title: '¡El volcán despierta!', text: 'Cuando se debilita, el Rey de Fuego sube fuera de tu alcance. El volcán del fondo abre los ojos y carga un rayo con la boca. Mantén C para agacharte; el jugador 2 usa la flecha abajo.' },
            { title: '¡Sigue luchando!', text: 'El Rey de Fuego regresa mareado después del rayo. ¡Golpéalo! Sus ataques normales continúan y el volcán vuelve a disparar si aún no lo has derrotado.' }
        ]
    }
};

export function bossName(type: string, language: 'en' | 'es') {
    if (type === 'LIVING_VOLCANO') return language === 'en' ? 'LIVING VOLCANO' : 'VOLCÁN VIVIENTE';
    if (type === 'BLAZE_KING') return language === 'en' ? 'BLAZE KING' : 'REY DE FUEGO';
    return type.replaceAll('_', ' ');
}
