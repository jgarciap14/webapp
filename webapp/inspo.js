let currentUser = localStorage.getItem('currentUser');
let persistentSession = localStorage.getItem('persistentSession');

// Redirect to login if not authenticated
if (!currentUser || persistentSession !== 'true') {
    window.location.href = 'login.html';
}

// Update last activity timestamp to maintain session
localStorage.setItem('lastActivity', new Date().toISOString());

function navigateTo(page) {
    window.location.href = page;
}

// Lista de citas del CSV
const quotes = [
    {text: "No importa lo lento que vayas, siempre y cuando no te detengas.", author: "Confucio"},
    {text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier"},
    {text: "Un día a la vez.", author: "Lema de recuperación (AA)"},
    {text: "Nuestra mayor gloria no está en no caer nunca, sino en levantarnos cada vez que caemos.", author: "Confucio"},
    {text: "Cree que puedes y ya estarás a mitad de camino.", author: "Theodore Roosevelt"},
    {text: "La fuerza no viene de la capacidad corporal, sino de la voluntad indomable.", author: "Mahatma Gandhi"},
    {text: "El primer paso para llegar a alguna parte es decidir que no vas a quedarte donde estás.", author: "J.P. Morgan"},
    {text: "La recuperación es un proceso. Requiere tiempo. Requiere paciencia. Requiere todo lo que tienes.", author: "Anónimo"},
    {text: "Lo que no me mata, me hace más fuerte.", author: "Friedrich Nietzsche"},
    {text: "En medio de la dificultad yace la oportunidad.", author: "Albert Einstein"},
    {text: "La vida es 10% lo que te pasa y 90% cómo reaccionas a ello.", author: "Charles R. Swindoll"},
    {text: "El coraje no es la ausencia de miedo, sino el triunfo sobre él.", author: "Nelson Mandela"},
    {text: "Tu vida no mejora por casualidad, mejora por el cambio.", author: "Jim Rohn"},
    {text: "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.", author: "Proverbio Chino"},
    {text: "No tienes que controlar tus pensamientos; solo tienes que dejar de permitir que ellos te controlen a ti.", author: "Dan Millman"},
    {text: "La adicción es solo una parte de tu historia, no el final.", author: "Anónimo"},
    {text: "La perseverancia no es una carrera larga; son muchas carreras cortas, una tras otra.", author: "Walter Elliot"},
    {text: "Cáete siete veces, levántate ocho.", author: "Proverbio Japonés"},
    {text: "El dolor es inevitable, el sufrimiento es opcional.", author: "Haruki Murakami (atribuido a Buda)"},
    {text: "La recuperación no es para la gente que la necesita. Es para la gente que la quiere.", author: "Anónimo"},
    {text: "No juzgues cada día por la cosecha que recoges, sino por las semillas que plantas.", author: "Robert Louis Stevenson"},
    {text: "El futuro pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt"},
    {text: "Nunca es demasiado tarde para ser lo que podrías haber sido.", author: "George Eliot"},
    {text: "La disciplina es el puente entre las metas y los logros.", author: "Jim Rohn"},
    {text: "El carácter no puede desarrollarse en la facilidad y la tranquilidad. Solo a través de la experiencia de la prueba y el sufrimiento se puede fortalecer el alma.", author: "Helen Keller"},
    {text: "No dejes que tu pasado determine tu futuro.", author: "Anónimo"},
    {text: "La gota de agua perfora la roca, no por su fuerza, sino por su constancia.", author: "Ovidio"},
    {text: "La recuperación es un maratón, no una carrera de velocidad.", author: "Anónimo"},
    {text: "Acepta la responsabilidad de tu vida. Date cuenta de que eres tú quien te llevará a donde quieres ir, nadie más.", author: "Les Brown"},
    {text: "El cambio más significativo en tu vida vendrá del cambio de creencias que tienes sobre ti mismo.", author: "Anónimo"},
    {text: "La sobriedad es un viaje, no un destino.", author: "Anónimo"},
    {text: "No puedes volver atrás y cambiar el principio, pero puedes empezar donde estás y cambiar el final.", author: "C.S. Lewis"},
    {text: "El único hombre que no se equivoca es el que nunca hace nada.", author: "Goethe"},
    {text: "La adversidad tiene el don de despertar talentos que en la prosperidad hubieran permanido dormidos.", author: "Horacio"},
    {text: "Un mar en calma nunca hizo a un marinero experto.", author: "Franklin D. Roosevelt"},
    {text: "Recuerda que solo porque tocaste fondo no significa que tengas que quedarte allí.", author: "Anónimo"},
    {text: "Nuestra mayor debilidad radica en renunciar. La forma más segura de tener éxito es siempre intentarlo una vez más.", author: "Thomas Edison"},
    {text: "Si estás pasando por un infierno, sigue adelante.", author: "Winston Churchill"},
    {text: "La voluntad de ganar, el deseo de tener éxito, el impulso para alcanzar tu pleno potencial... estas son las claves que abrirán la puerta a la excelencia personal.", author: "Confucio"},
    {text: "El valor no siempre ruge. A veces, el valor es la pequeña voz al final del día que dice: 'Lo intentaré de nuevo mañana'.", author: "Mary Anne Radmacher"},
    {text: "La recuperación es descubrir que la vida es mejor sin la sustancia que creías necesitar.", author: "Anónimo"},
    {text: "No soy producto de mis circunstancias. Soy producto de mis decisiones.", author: "Stephen Covey"},
    {text: "La esperanza es esa cosa con plumas que se posa en el alma.", author: "Emily Dickinson"},
    {text: "Cada día es una nueva oportunidad para cambiar tu vida.", author: "Anónimo"},
    {text: "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez más inteligentemente.", author: "Henry Ford"},
    {text: "No tengas miedo de renunciar a lo bueno para ir por lo grandioso.", author: "John D. Rockefeller"},
    {text: "La mente lo es todo. En lo que piensas, te conviertes.", author: "Buda"},
    {text: "El secreto para salir adelante es empezar.", author: "Mark Twain"},
    {text: "El viaje de mil millas comienza con un solo paso.", author: "Lao-Tsé"},
    {text: "El obstáculo es el camino.", author: "Marco Aurelio"},
    {text: "La recuperación te da la oportunidad de reescribir tu historia.", author: "Anónimo"},
    {text: "No mires el reloj; haz lo que él hace. Sigue moviéndote.", author: "Sam Levenson"},
    {text: "La adicción no es un fracaso moral, es una enfermedad tratable.", author: "Anónimo"},
    {text: "El éxito no es definitivo, el fracaso no es fatal: es el coraje de continuar lo que cuenta.", author: "Winston Churchill"},
    {text: "La vida se encoge o se expande en proporción al coraje de uno.", author: "Anaïs Nin"},
    {text: "Todo parece imposible hasta que se hace.", author: "Nelson Mandela"},
    {text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali"},
    {text: "La felicidad no es algo hecho. Proviene de tus propias acciones.", author: "Dalai Lama"},
    {text: "La única persona en la que estás destinado a convertirte es la persona que decides ser.", author: "Ralph Waldo Emerson"},
    {text: "La honestidad es el primer capítulo del libro de la sabiduría.", author: "Thomas Jefferson"},
    {text: "La recuperación es ser brutalmente honesto contigo mismo.", author: "Anónimo"},
    {text: "No necesitas ver toda la escalera, solo da el primer paso.", author: "Martin Luther King Jr."},
    {text: "Ser desafiado en la vida es inevitable, ser derrotado es opcional.", author: "Roger Crawford"},
    {text: "La curación no significa que el daño nunca existió. Significa que el daño ya no controla nuestras vidas.", author: "Anónimo"},
    {text: "El perdón es la llave para la acción y la libertad.", author: "Hannah Arendt"},
    {text: "No podemos cambiar las cartas que se nos reparten, solo cómo jugamos la mano.", author: "Randy Pausch"},
    {text: "Tu situación actual no es tu destino final.", author: "Anónimo"},
    {text: "La resiliencia es aceptar tu nueva realidad, incluso si es menos buena que la que tenías antes.", author: "Elizabeth Edwards"},
    {text: "Empieza donde estás. Usa lo que tienes. Haz lo que puedes.", author: "Arthur Ashe"},
    {text: "La autodisciplina es el poder de decir 'no' a tus impulsos destructivos.", author: "Anónimo"},
    {text: "El único viaje imposible es el que nunca empiezas.", author: "Tony Robbins"},
    {text: "Sé más fuerte que tu excusa más fuerte.", author: "Anónimo"},
    {text: "No se trata de la perfección. Se trata del esfuerzo.", author: "Jillian Michaels"},
    {text: "Cuando dudes, elige el camino de la disciplina.", author: "Anónimo"},
    {text: "La recuperación es un regalo que te das a ti mismo todos los días.", author: "Anónimo"},
    {text: "La verdadera fuerza es mantenerse firme cuando todos esperan que te desmorones.", author: "Anónimo"},
    {text: "No dejes que lo que no puedes hacer interfiera con lo que puedes hacer.", author: "John Wooden"},
    {text: "El sol siempre vuelve a brillar después de la tormenta.", author: "Proverbio"},
    {text: "Tu mejor maestro es tu último error.", author: "Ralph Nader"},
    {text: "Cada recuperación de una adicción comienza con la esperanza.", author: "Anónimo"},
    {text: "La paciencia y la perseverancia tienen un efecto mágico ante el cual las dificultades desaparecen.", author: "John Quincy Adams"},
    {text: "El coraje es la resistencia al miedo, el dominio del miedo, no la ausencia de miedo.", author: "Mark Twain"},
    {text: "No importa cuántas veces hayas fallado. Solo necesitas tener razón una vez.", author: "Mark Cuban"},
    {text: "Si quieres volar, tienes que renunciar a las cosas que te pesan.", author: "Toni Morrison"},
    {text: "La recuperación no es un evento aislado. Es un estilo de vida.", author: "Anónimo"},
    {text: "El carácter es la capacidad de llevar a cabo una buena resolución mucho después de que la emoción del momento haya pasado.", author: "Cavett Robert"},
    {text: "La serenidad no es estar libre de la tormenta, sino estar en paz dentro de la tormenta.", author: "Anónimo"},
    {text: "La recuperación es el acto de reclamar tu vida.", author: "Anónimo"},
    {text: "La victoria es más dulce cuando has conocido la derrota.", author: "Malcolm S. Forbes"},
    {text: "La vida es como andar en bicicleta. Para mantener el equilibrio, debes seguir moviéndote.", author: "Albert Einstein"},
    {text: "El progreso, no la perfección, es lo que buscamos.", author: "Lema de recuperación"},
    {text: "El primer deber del hombre es conquistarse a sí mismo.", author: "Anónimo"},
    {text: "Una mente negativa nunca te dará una vida positiva.", author: "Anónimo"},
    {text: "No dejes que la vergüenza te impida pedir ayuda.", author: "Anónimo"},
    {text: "La recuperación te enseña a vivir en el presente.", author: "Anónimo"},
    {text: "La adicción te dice que no puedes. La recuperación te dice que sí puedes.", author: "Anónimo"},
    {text: "El valor real es cuando sabes que estás vencido, pero sigues adelante de todos modos.", author: "James E. Faust"},
    {text: "La única diferencia entre un buen día y un mal día es tu actitud.", author: "Dennis S. Brown"},
    {text: "La curación es un arte. Lleva tiempo, lleva práctica, lleva amor.", author: "M.D."},
    {text: "No eres la oscuridad por la que has pasado. Eres la luz que ha sobrevivido.", author: "Anónimo"},
    {text: "El que tiene un porqué para vivir puede soportar casi cualquier cómo.", author: "Friedrich Nietzsche"},
    {text: "La rendición no es debilidad; es el comienzo de la recuperación.", author: "Anónimo"},
    {text: "Tu adicción no te define. Tu recuperación sí.", author: "Anónimo"},
    {text: "El mayor placer de la vida es hacer lo que la gente dice que no puedes hacer.", author: "Walter Bagehot"},
    {text: "La recuperación es un acto de rebeldía contra la adicción.", author: "Anónimo"},
    {text: "La sobriedad es la nueva felicidad.", author: "Anónimo"},
    {text: "Cada día sobrio es una victoria.", author: "Anónimo"},
    {text: "No te rindas. El principio es siempre lo más difícil.", author: "Anónimo"},
    {text: "Conviértete en la persona que necesitabas cuando estabas sufriendo.", author: "Anónimo"},
    {text: "El futuro tiene muchos nombres. Para los débiles, es lo inalcanzable. Para los temerosos, lo desconocido. Para los valientes, es la oportunidad.", author: "Victor Hugo"},
    {text: "La disciplina es simplemente elegir entre lo que quieres ahora y lo que más quieres.", author: "Anónimo"},
    {text: "Estás a una decisión de distancia de una vida completamente diferente.", author: "Anónimo"},
    {text: "No dejes que tu lucha se convierta en tu identidad.", author: "Anónimo"},
    {text: "La recuperación es el proceso de volver a ser tú mismo.", author: "Anónimo"},
    {text: "El secreto del cambio es enfocar toda tu energía, no en luchar contra lo viejo, sino en construir lo nuevo.", author: "Sócrates (popularizado por Dan Millman)"}
];

// Lista de imágenes
const images = [
    'pics/pic-1.jpg',
    'pics/pic-2.jpg',
    'pics/pic-3.jpg',
    'pics/pic-4.jpg',
    'pics/pic-5.jpg',
    'pics/pic-6.jpg',
    'pics/pic-7.jpg',
    'pics/pic-8.jpg',
    'pics/pic-9.jpg',
    'pics/pic-10.jpg'
];

// Función para obtener el índice del día
function getDayIndex() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear;
}

// Cargar inspiración del usuario
function loadUserInspiration() {
    const inspiration = localStorage.getItem(`inspiration_${currentUser}`);
    if (inspiration) {
        document.getElementById('userInspiration').textContent = inspiration;
    }
}

// Cargar cita y imagen del día
function loadDailyContent() {
    const dayIndex = getDayIndex();

    // Seleccionar cita del día
    const quoteIndex = dayIndex % quotes.length;
    const dailyQuote = quotes[quoteIndex];

    // Seleccionar imagen del día
    const imageIndex = dayIndex % images.length;
    const dailyImage = images[imageIndex];

    // Actualizar contenido
    document.getElementById('quoteText').textContent = `"${dailyQuote.text}"`;
    document.getElementById('quoteAuthor').textContent = `— ${dailyQuote.author}`;

    const imageElement = document.getElementById('dailyImage');
    imageElement.src = dailyImage;

    // Debug: verificar si la imagen se carga correctamente
    imageElement.onerror = function() {
        console.error('Error al cargar la imagen:', dailyImage);
        console.log('Ruta intentada:', this.src);
    };

    imageElement.onload = function() {
        console.log('Imagen cargada exitosamente:', dailyImage);
    };
}

// Initialize
loadUserInspiration();
loadDailyContent();
