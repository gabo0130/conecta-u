/**
 * Textos legales que la persona acepta al registrarse y al editar «Mi perfil» (v2.2, E2).
 * Lenguaje sencillo: resumen de lo que implica cada casilla, no reemplaza la política oficial
 * de tratamiento de datos de la UFPS.
 */

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  href: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

export const DATA_TREATMENT: LegalDocument = {
  href: "/terminos/tratamiento-de-datos",
  title: "Autorización de tratamiento de datos personales",
  intro:
    "Al marcar la casilla autorizas a Conecta U a guardar y usar tus datos personales para lo que se explica aquí, según la Ley 1581 de 2012 (protección de datos personales en Colombia).",
  sections: [
    {
      heading: "Qué datos guardamos",
      paragraphs: [
        "Tus datos de identificación y contacto: nombres, documento, correo, correo alterno, teléfono, nacionalidad y código institucional.",
        "Tu perfil técnico: programa, conocimientos técnicos, competencias técnicas y blandas, experiencia y disponibilidad.",
      ],
    },
    {
      heading: "Para qué los usamos",
      paragraphs: [
        "Para recomendarte a los líderes de proyectos de la UFPS cuyo proyecto necesita un perfil como el tuyo, y para que te puedan convocar.",
        "Para calcular las recomendaciones usamos un servicio de inteligencia artificial al que solo enviamos tu perfil técnico. Tu documento, correo y teléfono nunca se envían a ese servicio ni aparecen en las recomendaciones.",
      ],
    },
    {
      heading: "Quién los ve",
      paragraphs: [
        "Tus datos de identificación y contacto solo los ves tú y el administrador de la plataforma.",
        "Los líderes de proyecto ven tu nombre, tu programa y tu perfil técnico cuando apareces recomendado.",
      ],
    },
    {
      heading: "Tus derechos",
      paragraphs: [
        "Puedes conocer, actualizar y corregir tus datos en cualquier momento desde «Mi perfil».",
        "Puedes retirar esta autorización desmarcando la casilla en «Mi perfil»: desde ese momento dejas de aparecer en las recomendaciones. Para eliminar tus datos, escríbele al administrador de la plataforma.",
      ],
    },
  ],
};

export const TRUTHFULNESS_DECLARATION: LegalDocument = {
  href: "/terminos/declaracion-de-veracidad",
  title: "Declaración de veracidad",
  intro:
    "Al marcar la casilla declaras que la información que registras en Conecta U es verdadera y que presentarás los soportes cuando se te soliciten.",
  sections: [
    {
      heading: "Qué declaras",
      paragraphs: [
        "Que tus datos personales, tus conocimientos, tus competencias y tu experiencia son reales y están al día.",
        "Que, si un líder de proyecto o la universidad te lo pide, mostrarás los soportes: certificados, constancias o trabajos que lo demuestren.",
      ],
    },
    {
      heading: "Por qué te lo pedimos",
      paragraphs: [
        "La Constitución Política de Colombia (artículo 83) establece que las actuaciones de las personas se rigen por el principio de buena fe, que se presume. Por eso no te pedimos soportes al registrarte: confiamos en lo que declaras.",
        "Las recomendaciones se calculan con la información que cada persona declara. Que sea verídica es lo que permite que un líder confíe en ellas.",
      ],
    },
    {
      heading: "Qué pasa si algo no es cierto",
      paragraphs: [
        "Las recomendaciones están sujetas a verificación: el líder puede pedirte los soportes antes de convocarte.",
        "Si la información no corresponde a la realidad, el administrador puede corregir tu perfil o inhabilitar tu acceso a la plataforma.",
      ],
    },
  ],
};

export const DATA_CONSENT_LABEL =
  "Autorizo el tratamiento de mis datos personales para las recomendaciones y convocatorias de Conecta U (Ley 1581 de 2012).";

export const TRUTHFULNESS_LABEL =
  "Declaro que la información registrada es verídica y que presentaré los soportes cuando se me soliciten (principio de buena fe).";

export const TRUTHFULNESS_REQUIRED = "Debes declarar que la información registrada es verídica.";
