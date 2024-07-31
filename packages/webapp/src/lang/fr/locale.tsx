// @ts-nocheck
import printValue from '../printValue';

export const locale = {
  mixed: {
    default: '${path} est invalide',
    required: '${path} est un champ requis',
    oneOf: '${path} doit etre l\'une de ces valeurs: ${values}',
    notOneOf: '${path} ne doit pas etre l\'une de ces valeurs: ${values}',
    notType: ({ path, type, value, originalValue }) => {
      let isCast = originalValue != null && originalValue !== value;
      let msg =
        `${path} doit etre de type \`${type}\` ` +
        `mais la valeur finale est: \`${printValue(value, true)}\`` +
        (isCast
          ? ` (à partir de la valeur \`${printValue(originalValue, true)}\`).`
          : '.');

      if (value === null) {
        msg += `\n Si "null" est destiné à être une valeur vide, assurez-vous de marquer le schéma comme \`.nullable()\``;
      }

      return msg;
    },
    defined: '${path} doit etre défini',
  },
  string: {
    length: '${path} doit contenir exactement ${length} characteres',
    min: '${path} doit avoir au moins ${min} characteres',
    max: '${path} doit avoir au plus ${max} characteres',
    matches: '${path} doit correspondre à ce qui suit: "${regex}"',
    email: '${path} doit etre un email valide',
    url: '${path}doit etre une URL valide',
    trim: '${path} doit être une chaîne tronquée',
    lowercase: '${path} doit être une chaîne de caractères minuscules',
    uppercase: '${path} doit être une chaîne de caractères majuscules',
  },
  number: {
    min: '${path} doit être supérieur ou égal à ${min}',
    max: '${path} doit être inférieur ou égal à ${max}',
    lessThan: '${path} doit être inférieur à ${less}',
    moreThan: '${path} doit être supérieur à ${more}',
    notEqual: '${path} doit être différent de ${notEqual}',
    positive: '${path} doit être un nombre positif',
    negative: '${path} doit être un nombre négatif',
    integer: '${path} doit être un nombre entier',
  },
  date: {
    min: '${path} doit être postérieur à ${min}',
    max: '${path} doit être antérieur à ${max}',
  },
  boolean: {},
  object: {
    noUnknown:
      '${path} ne peut pas avoir de clés non spécifiées dans la forme de l\'objet',
  },
  array: {
    min: '${path} doit avoir au moins ${min} items',
    max: '${path} doit être inférieur ou égal à ${max} items',
  },
};
